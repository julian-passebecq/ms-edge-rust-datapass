// Local navigation-only X feed collection. No X API, DOM injection, scraping or timers.
export const X_FEEDS_KEY='datapass.edge.x-feeds.v1';
export const MAX_CUSTOM_FEEDS=24;
export const PRESETS=Object.freeze([
  {id:'home',label:'Accueil',description:'Pour vous et Abonnements se choisissent dans X. Les deux utilisent x.com/home.',url:'https://x.com/home',group:'Principal'},
  {id:'lists',label:'Mes listes',description:'Ouvre le répertoire de tes listes X sans lire son contenu.',url:'https://x.com/i/lists',group:'Principal'},
  {id:'bookmarks',label:'Signets',description:'Tes posts enregistrés, visibles uniquement dans ton compte X.',url:'https://x.com/i/bookmarks',group:'Principal'},
  {id:'agents',label:'IA & agents',description:'Recherche X sur les systèmes multi-agents et les outils de développement.',url:'https://x.com/search?q=AI+agents&f=live',group:'Découverte'},
  {id:'fabric',label:'Microsoft Fabric',description:'Publications récentes relatives à Microsoft Fabric et Power BI.',url:'https://x.com/search?q=Microsoft+Fabric&f=live',group:'Découverte'},
  {id:'visuals',label:'Visualisation',description:'Inspiration interfaces, data visualisation et dashboards.',url:'https://x.com/search?q=data+visualization&f=live',group:'Découverte'}
]);
export function cleanFeedLabel(value){
  if(typeof value!=='string')return null;
  const label=value.replace(/[\x00-\x1f\x7f]/g,'').replace(/\s+/g,' ').trim().slice(0,60);
  return label.length>=2?label:null;
}
export function normalizeXUrl(value){
  if(typeof value!=='string'||value.length>1200)return null;
  if(/(?:\/|%2f)(?:\.{1,2}|%2e(?:%2e)?)(?:\/|%2f)/i.test(value))return null;
  let url;try{url=new URL(value);}catch{return null;}
  if(url.protocol!=='https:'||url.username||url.password||url.port||url.hash)return null;
  if(!['x.com','www.x.com','twitter.com','www.twitter.com'].includes(url.hostname.toLowerCase()))return null;
  const path=url.pathname;
  const isAllowed=/^\/(?:home|search|explore|i\/(?:bookmarks|lists(?:\/[0-9]{1,24})?|communities(?:\/[0-9]{1,24})?)|hashtag\/[A-Za-z0-9_]{1,50}|[A-Za-z0-9_]{1,15}(?:\/lists)?)\/?$/.test(path);
  if(!isAllowed)return null;
  const denied=new Set(['login','signup','settings','account','messages','compose','intent','logout','privacy','tos','admin']);
  const segment=path.split('/')[1]?.toLowerCase();
  if(denied.has(segment))return null;
  const safe=new URL('https://x.com'+path.replace(/\/$/,''));
  if(path==='/search'){
    const q=url.searchParams.get('q')?.trim();
    if(!q||q.length>160)return null;
    safe.searchParams.set('q',q);
    const f=url.searchParams.get('f');if(['live','top','media'].includes(f))safe.searchParams.set('f',f);
  }
  return safe.toString();
}
export function normalizeXFeeds(raw){
  const input=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  const used=new Set(PRESETS.map(x=>x.url)),custom=[];
  for(const item of Array.isArray(input.custom)?input.custom:[]){
    const label=cleanFeedLabel(item?.label),url=normalizeXUrl(item?.url);
    if(!label||!url||used.has(url)||custom.length>=MAX_CUSTOM_FEEDS)continue;
    const id=typeof item.id==='string'&&/^custom-[a-zA-Z0-9-]{6,75}$/.test(item.id)?item.id:null;
    if(!id||custom.some(x=>x.id===id))continue;
    custom.push({id,label,url,group:'Mes flux',description:'Flux personnel enregistré dans ce profil Edge'});
    used.add(url);
  }
  const all=[...PRESETS,...custom];
  return {version:1,activeId:all.some(x=>x.id===input.activeId)?input.activeId:PRESETS[0].id,custom};
}
export function allFeeds(state){return [...PRESETS,...normalizeXFeeds(state).custom];}
export function addXFeed(state,label,url,id){
  const normalized=normalizeXFeeds(state),name=cleanFeedLabel(label),link=normalizeXUrl(url);
  if(!name)throw Error('Donne un nom de 2 à 60 caractères.');
  if(!link)throw Error('URL X HTTPS de flux, liste, recherche ou profil invalide.');
  if(allFeeds(normalized).some(x=>x.url===link))throw Error('Ce flux existe déjà.');
  if(normalized.custom.length>=MAX_CUSTOM_FEEDS)throw Error('Maximum 24 flux personnels.');
  if(!/^custom-[a-zA-Z0-9-]{6,75}$/.test(id)||allFeeds(normalized).some(x=>x.id===id))throw Error('Identifiant de flux invalide.');
  return {...normalized,custom:[...normalized.custom,{id,label:name,url:link,group:'Mes flux',description:'Flux personnel enregistré dans ce profil Edge'}],activeId:id};
}
export function removeXFeed(state,id){
  const normalized=normalizeXFeeds(state),removed=normalized.custom.filter(x=>x.id!==id);
  if(removed.length===normalized.custom.length)return normalized;
  return {...normalized,custom:removed,activeId:normalized.activeId===id?PRESETS[0].id:normalized.activeId};
}
export function shiftXFeed(state,id,delta){
  const normalized=normalizeXFeeds(state),idx=normalized.custom.findIndex(x=>x.id===id);
  const dest=idx+delta;if(idx<0||dest<0||dest>=normalized.custom.length)return normalized;
  const custom=normalized.custom.slice();[custom[idx],custom[dest]]=[custom[dest],custom[idx]];
  return {...normalized,custom};
}
