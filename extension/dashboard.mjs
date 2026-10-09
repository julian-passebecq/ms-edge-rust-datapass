import {CATALOG,GALAXY_TARGETS,DASHBOARD_KEY,WORKSPACE_KEY,defaultDashboard,normalizeDashboard,feedUrl,safeHttp} from "./dashboard-data.mjs";
import {initialState,normalizeState} from "./core.mjs";
import {requestSource,fetchPublicFeed,fetchRepositoryStatus} from "./dashboard-feed.mjs";
import {renderDashboard} from "./dashboard-render.mjs";
import {renderTree} from "./dashboard-tree.mjs";
import {bindDashboardActions} from "./dashboard-actions.mjs";
import {currentCards} from "./dashboard-presets.mjs";
import {normalizedClosedSessions} from "./dashboard-recovery.mjs";

let state=defaultDashboard(),workspaces=initialState(),tabs=[],queue=Promise.resolve();
const feeds=new Map(),errors=new Map(),loading=new Set(),repos=new Map();
let closedSessions=[],closedStatus="not-requested";
const system={snapshot:null,error:null,loading:false};
const ctx={
  get state(){return state;},get workspaces(){return workspaces;},
  get tabs(){return tabs;},
  get closedSessions(){return closedSessions;},get closedStatus(){return closedStatus;},
  system,feeds,errors,loading,repos,
  mutate,refreshFeed,refreshVisible,refreshRepos,reloadWorkspaces,run,show,open,
  readClosed,restoreClosed,readSystem,openSelectedWorkspace
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
  workspaces=normalizeState(stored);render();
}
async function refreshTabs(){
  tabs=(await chrome.tabs.query({currentWindow:true}))
    .filter(tab=>safeHttp(tab.url))
    .sort((a,b)=>(a.index??0)-(b.index??0));
  render();
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
  const cards=new Set(currentCards(state).filter(c=>c.visible&&
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
    const publicTargets=GALAXY_TARGETS.filter(p=>p.access==="public").map(p=>p.repo);
    const list=[...new Set([...publicTargets,...state.repos])].slice(0,12);
    let cursor=0;
    async function worker(){
      while(cursor<list.length){
        const repo=list[cursor++];
        try{repos.set(repo,await fetchRepositoryStatus(repo));}
        catch(error){
          repos.set(repo,{status:"indisponible",url:null,sha:null});
          console.warn("Public repo CI unavailable",repo,error);
        }
      }
    }
    await Promise.all(Array.from({length:Math.min(3,list.length)},()=>worker()));
    show("GitHub : statuts des derniers workflows publics consultés.");
  }catch(error){errors.set("repos",error.message||String(error));}
  finally{loading.delete("repos");render();}
}
async function readClosed(){
  if(closedStatus==="loading")return;
  // Request from direct button gesture; only current profile's recently closed metadata.
  const permission=chrome.permissions.request({permissions:["sessions"]});
  closedStatus="loading";render();
  try{
    if(!await permission){closedStatus="denied";show("Permission sessions non accordée.");return;}
    const entries=await chrome.sessions.getRecentlyClosed({maxResults:25});
    closedSessions=normalizedClosedSessions(entries);
    closedStatus="ready";
    show(closedSessions.length+" onglets de travail récemment fermés accessibles.");
  }catch(error){
    closedStatus="unavailable";show("Historique récent Edge indisponible : "+error.message);
  }finally{render();}
}
async function restoreClosed(id){
  const item=closedSessions.find(s=>s.sessionId===id);
  if(!item)throw Error("Cette session n'est plus disponible.");
  await chrome.sessions.restore(item.sessionId);
  closedSessions=closedSessions.filter(s=>s.sessionId!==id);
  await refreshTabs();
}
function validatedSnapshot(raw){
  if(!raw||typeof raw!=="object")throw Error("Format de diagnostic inattendu.");
  const max=2**60;
  const count=value=>Number.isFinite(value)&&value>=0&&value<max?value:null;
  const groups=new Set(["Edge","Ollama","Docker","Node"]);
  const processes=(Array.isArray(raw.processes)?raw.processes:[]).filter(p=>groups.has(p?.label))
    .slice(0,4).map(p=>({label:p.label,count:count(p.count)??0,residentBytes:count(p.residentBytes)}));
  const disks=(Array.isArray(raw.disks)?raw.disks:[]).slice(0,3)
    .map(d=>({availableBytes:count(d?.availableBytes),totalBytes:count(d?.totalBytes)}));
  return {platform:String(raw.platform||"unknown").slice(0,20),
    observedAtMs:count(raw.observedAtMs),
    cpuPercent:Number.isFinite(raw.cpuPercent)&&raw.cpuPercent>=0&&raw.cpuPercent<=100?
      raw.cpuPercent:null,
    memory:{totalBytes:count(raw.memory?.totalBytes),usedBytes:count(raw.memory?.usedBytes),
      availableBytes:count(raw.memory?.availableBytes)},
    processes,disks};
}
async function readSystem(){
  if(system.loading)return;
  // Single opt-in request: Edge spawns Rust host once; no daemon or polling.
  const permission=chrome.permissions.request({permissions:["nativeMessaging"]});
  system.loading=true;system.error=null;render();
  try{
    if(!await permission)throw Error("Permission Native Messaging refusée.");
    const response=await chrome.runtime.sendNativeMessage("com.datapass.edgebridge",{op:"system_snapshot"});
    if(!response?.ok||response.app!=="datapass-edge-bridge")
      throw Error("Host non disponible ou trop ancien ; reconstruis le bridge Rust.");
    system.snapshot=validatedSnapshot(response.snapshot);
    show("Diagnostic local terminé. Aucun transfert réseau.");
  }catch(error){
    system.error=error?.message||String(error);
    show("Diagnostic PC indisponible : "+system.error);
  }finally{system.loading=false;render();}
}
async function openSelectedWorkspace(){
  const active=workspaces.projects.find(p=>p.id===workspaces.activeProjectId);
  if(!active?.links.length)throw Error("Aucun lien dans ce workspace.");
  const links=active.links.slice(0,6);
  if(!window.confirm("Ouvrir jusqu'à "+links.length+" onglets du workspace "+active.name+" ?"))return;
  for(const link of links)await open(link.url);
  await refreshTabs();
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
    if(changes[WORKSPACE_KEY]){workspaces=normalizeState(changes[WORKSPACE_KEY].newValue);render();}
  });
  let timer;
  const changed=()=>{clearTimeout(timer);timer=setTimeout(()=>void run(refreshTabs),180);};
  for(const type of ["onCreated","onRemoved","onUpdated","onActivated"])
    chrome.tabs[type].addListener(changed);
  window.addEventListener("focus",()=>void run(refreshTabs));
}
void start().catch(error=>{console.error(error);show("Démarrage impossible : "+error.message);});
