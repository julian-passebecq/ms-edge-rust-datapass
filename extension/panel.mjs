import {initialState,normalizeState,safeUrl} from "./core.mjs";
import {render} from "./ui.mjs";
import {bindWorkspaces} from "./controls-workspaces.mjs";
import {bindTabs} from "./controls-tabs.mjs";
import {bindBackup} from "./controls-backup.mjs";
const KEY="datapass.edge.workspaces.v1";
let state=initialState(),tabs=[],queue=Promise.resolve();
const selected=()=>state.projects.find(p=>p.id===state.activeProjectId)||state.projects[0];
function show(message,error=false){
  const el=document.getElementById("toast");
  el.textContent=String(message);el.className="toast visible"+(error?" error":"");
}
function fail(e){console.error(e);show(e.message||String(e),true);}
function run(fn){return Promise.resolve().then(fn).catch(fail);}
function paint(){render(state,tabs);}
async function refresh(){
  tabs=(await chrome.tabs.query({currentWindow:true})).filter(t=>safeUrl(t.url));
  paint();
}
async function transact(fn){
  queue=queue.catch(()=>{}).then(async()=>{
    const stored=(await chrome.storage.local.get(KEY))[KEY];
    state=normalizeState(fn(normalizeState(stored??state)));
    await chrome.storage.local.set({[KEY]:state});
    paint();
  });
  return queue;
}
const api={selected,getState:()=>state,getTabs:()=>tabs,transact,refresh,run,show};
async function init(){
  state=normalizeState((await chrome.storage.local.get(KEY))[KEY]);
  bindWorkspaces(api);bindTabs(api);bindBackup(api);
  await refresh();
}
void init().catch(fail);
