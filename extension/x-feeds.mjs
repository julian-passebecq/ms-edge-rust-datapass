import {X_FEEDS_KEY,PRESETS,allFeeds,normalizeXFeeds,normalizeXUrl,addXFeed,removeXFeed,shiftXFeed} from './x-feeds-model.mjs';
const $=id=>document.getElementById(id);
let state=normalizeXFeeds(null),writeQueue=Promise.resolve(),opened=new Map();
function element(tag,text,css){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(css)n.className=css;return n;}
function tell(message){const toast=$('toast');toast.hidden=false;toast.textContent=String(message).slice(0,300);}
function clearStatus(){$('toast').hidden=true;}
function currentFeed(){return allFeeds(state).find(x=>x.id===state.activeId)||PRESETS[0];}
async function write(change){
  writeQueue=writeQueue.catch(()=>{}).then(async()=>{
    const saved=(await chrome.storage.local.get(X_FEEDS_KEY))[X_FEEDS_KEY];
    const updated=normalizeXFeeds(change(normalizeXFeeds(saved)));
    await chrome.storage.local.set({[X_FEEDS_KEY]:updated});state=updated;render();
  });return writeQueue;
}
async function openFeed(feed){
  const url=normalizeXUrl(feed?.url);
  if(!url)throw Error('Adresse X invalide : ouverture refusée.');
  const candidate=(await chrome.tabs.query({currentWindow:true})).find(tab=>normalizeXUrl(tab.url)===url);
  if(candidate?.id)await chrome.tabs.update(candidate.id,{active:true});
  else await chrome.tabs.create({url,active:true});
  tell('Flux ouvert dans X. Aucun post récupéré par DataPass.');
}
async function findOpenTabs(){
  const tabs=await chrome.tabs.query({currentWindow:true});opened=new Map();
  for(const item of tabs){const key=normalizeXUrl(item.url);if(key)opened.set(key,(opened.get(key)||0)+1);}
  render();
}
function choose(id){void write(s=>({...s,activeId:id})).catch(e=>tell(e.message));clearStatus();}
function render(){
  const collection=allFeeds(state),selected=currentFeed(),bar=$('feed-tabs'),detail=$('feed-details');
  $('count').textContent=collection.length+' flux';bar.replaceChildren();
  for(const group of ['Principal','Découverte','Mes flux']){
    for(const feed of collection.filter(f=>f.group===group)){
      const b=element('button',feed.label,'feed-tab');b.type='button';b.role='tab';
      b.id='tab-'+feed.id;b.setAttribute('aria-controls','feed-details');
      b.setAttribute('aria-selected',String(selected.id===feed.id));b.tabIndex=selected.id===feed.id?0:-1;
      b.addEventListener('click',()=>choose(feed.id));bar.append(b);
    }
  }
  detail.setAttribute('aria-labelledby','tab-'+selected.id);detail.replaceChildren();
  detail.append(element('p',selected.group,'info-label'),element('h2',selected.label,'feed-name'),
    element('p',selected.description,'description'));
  detail.append(element('div',selected.url,'address'));
  const row=element('div',undefined,'feed-tools');
  const open=element('button','Ouvrir ce flux dans X ↗','primary');open.type='button';
  open.addEventListener('click',()=>void openFeed(selected).catch(e=>tell(e.message)));row.append(open);
  const copy=element('button','Copier le lien','secondary');copy.type='button';
  copy.addEventListener('click',()=>void navigator.clipboard.writeText(selected.url)
    .then(()=>tell('Lien copié.'),()=>tell('Copie indisponible ; sélectionne l’adresse affichée.')));row.append(copy);
  if(selected.group==='Mes flux'){
    for(const [label,delta] of [['←',-1],['→',1]]){
      const btn=element('button','Déplacer '+label,'small');btn.type='button';
      btn.addEventListener('click',()=>void write(s=>shiftXFeed(s,selected.id,delta)).catch(e=>tell(e.message)));row.append(btn);
    }
    const rm=element('button','Supprimer ce flux','small danger');rm.type='button';
    rm.addEventListener('click',()=>{
      if(!confirm('Supprimer ce raccourci local ? Aucun onglet X ni donnée de ton compte ne sera supprimé.'))return;
      void write(s=>removeXFeed(s,selected.id)).catch(e=>tell(e.message));
    });row.append(rm);
  }
  detail.append(row);
  const count=opened.get(normalizeXUrl(selected.url))||0;
  detail.append(element('p',count?count+' onglet(s) X correspondant(s) dans cette fenêtre Edge.':'Aucun onglet correspondant actuellement observé.','status'));
  if(selected.id==='home')detail.append(element('p','Les sous-onglets « Pour vous » et « Abonnements » se sélectionnent sur X après ouverture.','status'));
}
async function start(){
  const raw=await chrome.storage.local.get(X_FEEDS_KEY);state=normalizeXFeeds(raw[X_FEEDS_KEY]);render();
  $('add-feed').addEventListener('submit',event=>{
    event.preventDefault();const name=$('feed-title').value,url=$('feed-url').value;
    void write(s=>addXFeed(s,name,url,'custom-'+crypto.randomUUID())).then(()=>{
      $('add-feed').reset();tell('Flux ajouté dans ton profil Edge.');
    }).catch(e=>tell(e.message));
  });
  $('feed-tabs').addEventListener('keydown',event=>{
    const values=allFeeds(state),index=values.findIndex(x=>x.id===state.activeId);
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
      event.preventDefault();const to=(index+(event.key==='ArrowRight'?1:-1)+values.length)%values.length;
      choose(values[to].id);requestAnimationFrame(()=>$('tab-'+values[to].id)?.focus());
    }
  });
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area==='local'&&changes[X_FEEDS_KEY]){state=normalizeXFeeds(changes[X_FEEDS_KEY].newValue);render();}
  });
  window.addEventListener('focus',()=>void findOpenTabs().catch(()=>{}));
  await findOpenTabs();
}
start().catch(e=>tell('Impossible de charger X / Feeds : '+e.message));
