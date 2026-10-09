import {CATALOG,DASHBOARD_KEY,WORKSPACE_KEY,defaultDashboard,normalizeDashboard,feedUrl,safeHttp} from "./dashboard-data.mjs";
import {initialState,normalizeState} from "./core.mjs";
import {requestSource,fetchPublicFeed,fetchRepositoryStatus} from "./dashboard-feed.mjs";
import {renderDashboard} from "./dashboard-render.mjs";
import {renderTree} from "./dashboard-tree.mjs";
import {bindDashboardActions} from "./dashboard-actions.mjs";

let state=defaultDashboard(),workspaces=initialState(),tabs=[],queue=Promise.resolve();
const feeds=new Map(),errors=new Map(),loading=new Set(),repos=new Map();
const ctx={
  get state(){return state;},get workspaces(){return workspaces;},
  get tabs(){return tabs;},feeds,errors,loading,repos,
  mutate,refreshFeed,refreshVisible,refreshRepos,reloadWorkspaces,run,show,open
};
function show(message){
  const bar=document.getElementById("notice");
  bar.textContent=String(message);bar.hidden=false;
  clearTimeout(show.timer);
  show.timer=setTimeout(()=>{bar.hidden=true;},5400);
}
function run(task){
  return Promise.resolve().then(task).catch(error=>{
    console.error("DataPass dashboard",error);
    show("Erreur : "+(error?.message||String(error)));
  });
}
function render(){
  renderDashboard(ctx);
  renderTree(workspaces,tabs);
}
async function mutate(change){
  queue=queue.catch(()=>{}).then(async()=>{
    const current=(await chrome.storage.local.get(DASHBOARD_KEY))[DASHBOARD_KEY]??state;
    const next=normalizeDashboard(change(normalizeDashboard(current)));
    await chrome.storage.local.set({[DASHBOARD_KEY]:next});
    state=next;render();
  });
  return queue;
}
async function reloadWorkspaces(){
  const stored=(await chrome.storage.local.get(WORKSPACE_KEY))[WORKSPACE_KEY];
  workspaces=normalizeState(stored);renderTree(workspaces,tabs);
}
async function refreshTabs(){
  tabs=(await chrome.tabs.query({currentWindow:true}))
    .filter(tab=>safeHttp(tab.url))
    .sort((a,b)=>(a.index??0)-(b.index??0));
  renderTree(workspaces,tabs);
}
async function open(raw){
  const url=safeHttp(raw);
  if(!url)throw Error("Lien externe non accepté.");
  const existing=tabs.find(tab=>safeHttp(tab.url)===url);
  if(existing)await chrome.tabs.update(existing.id,{active:true});
  else await chrome.tabs.create({url,active:true});
}
async function refreshFeed(id){
  const def=CATALOG.find(d=>d.id===id);
  if(!def?.feed)return;
  if(loading.has(id))return;
  const origin=new URL(feedUrl(def.feed)).origin;
  // Called synchronously by a click; permission is requested before awaiting anything.
  const permission=requestSource(origin);
  loading.add(id);errors.delete(id);render();
  try{
    if(!await permission)throw Error("Autorisation du flux refusée.");
    feeds.set(id,await fetchPublicFeed(def.feed));
    show(def.title+" : titres actualisés (source vérifiée à l’ouverture).");
  }catch(error){
    errors.set(id,error?.message||String(error));
    show(def.title+" : source indisponible, ouvre le site original.");
  }finally{
    loading.delete(id);render();
  }
}
async function refreshVisible(){
  if(loading.has("bulk"))return;
  const cards=new Set(state.cards.filter(c=>c.visible&&
    (state.section==="all"||CATALOG.find(d=>d.id===c.id)?.section===state.section)).map(c=>c.id));
  const defs=CATALOG.filter(d=>d.feed&&cards.has(d.id));
  if(!defs.length){show("Aucun flux d'actualités visible dans cette vue.");return;}
  const origins=[...new Set(defs.map(d=>new URL(feedUrl(d.feed)).origin))];
  // Permission request happens directly inside a toolbar click's user gesture.
  const permission=chrome.permissions.request({origins:origins.map(origin=>origin+"/*")});
  loading.add("bulk");
  defs.forEach(d=>{loading.add(d.id);errors.delete(d.id);});
  render();
  try{
    if(!await permission)throw Error("Autorisation des sources refusée.");
    let cursor=0,successes=0,failures=0;
    async function worker(){
      while(cursor<defs.length){
        const def=defs[cursor++];
        try{feeds.set(def.id,await fetchPublicFeed(def.feed));successes++;}
        catch(error){errors.set(def.id,error?.message||String(error));failures++;}
        finally{loading.delete(def.id);render();}
      }
    }
    await Promise.all(Array.from({length:Math.min(3,defs.length)},()=>worker()));
    show(successes+" flux mis à jour"+(failures?" · "+failures+" indisponibles":"")+".");
  }catch(error){
    for(const d of defs)errors.set(d.id,error?.message||String(error));
    show("Actualisation refusée ou impossible : "+(error?.message||String(error)));
  }finally{
    defs.forEach(d=>loading.delete(d.id));
    loading.delete("bulk");render();
  }
}
async function refreshRepos(){
  if(loading.has("repos"))return;
  const permission=requestSource("https://api.github.com");
  loading.add("repos");errors.delete("repos");render();
  try{
    if(!await permission)throw Error("Autorisation GitHub refusée.");
    const list=state.repos.slice(0,8);
    for(const repo of list){
      try{repos.set(repo,await fetchRepositoryStatus(repo));}
      catch(error){repos.set(repo,{status:"indisponible",url:null,sha:null});console.warn("Repo status",repo,error);}
    }
    show("GitHub : statuts des derniers workflows publics consultés.");
  }catch(error){errors.set("repos",error.message||String(error));}
  finally{loading.delete("repos");render();}
}
async function start(){
  const saved=await chrome.storage.local.get([DASHBOARD_KEY,WORKSPACE_KEY]);
  state=normalizeDashboard(saved[DASHBOARD_KEY]);
  workspaces=normalizeState(saved[WORKSPACE_KEY]);
  bindDashboardActions(ctx);
  await refreshTabs();
  render();
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area!=="local")return;
    if(changes[DASHBOARD_KEY]){state=normalizeDashboard(changes[DASHBOARD_KEY].newValue);render();}
    if(changes[WORKSPACE_KEY]){workspaces=normalizeState(changes[WORKSPACE_KEY].newValue);renderTree(workspaces,tabs);}
  });
  let timer;
  const changed=()=>{clearTimeout(timer);timer=setTimeout(()=>void run(refreshTabs),180);};
  for(const type of ["onCreated","onRemoved","onUpdated","onActivated"])
    chrome.tabs[type].addListener(changed);
  window.addEventListener("focus",()=>void run(refreshTabs));
}
void start().catch(error=>{console.error(error);show("Démarrage impossible : "+error.message);});
