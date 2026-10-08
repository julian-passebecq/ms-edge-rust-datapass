import {addLink} from "./core.mjs";
import {bindCapture} from "./controls-capture.mjs";
import {bindSleep} from "./controls-sleep.mjs";
const $=id=>document.getElementById(id);
export function bindTabs(api){
  $("search").addEventListener("input",()=>api.refresh());
  $("refresh").addEventListener("click",()=>api.run(api.refresh));
  $("save-tab").addEventListener("click",()=>api.run(async()=>{
    const tab=api.getTabs().find(t=>t.active);
    if(!tab)throw Error("Open a web page first.");
    await api.transact(s=>addLink(s,api.selected().id,{url:tab.url,title:tab.title}));
    api.show("Current tab saved.");
  }));
  $("open-tabs").addEventListener("click",event=>{
    const b=event.target.closest("button[data-action]");if(!b)return;
    api.run(async()=>{
      const tab=api.getTabs().find(t=>t.id===Number(b.dataset.tab));
      if(!tab)return;
      if(b.dataset.action==="activate-tab"){
        await chrome.tabs.update(tab.id,{active:true});await api.refresh();
      }
      if(b.dataset.action==="save-open-tab"){
        await api.transact(s=>addLink(s,api.selected().id,{url:tab.url,title:tab.title}));
        api.show("Tab saved to workspace.");
      }
    });
  });
  document.addEventListener("keydown",event=>{
    const field=document.activeElement?.tagName;
    const editing=field==="INPUT"||field==="TEXTAREA";
    if((event.key==="/"&&!editing&&!event.ctrlKey&&!event.altKey&&!event.metaKey)
      ||(event.key.toLowerCase()==="k"&&event.ctrlKey&&event.shiftKey)){
      event.preventDefault();$("search").focus();$("search").select();
    }
    if(event.key==="Escape"&&document.activeElement===$("search")){
      $("search").value="";$("search").blur();api.run(api.refresh);
    }
  });
  let refreshTimer;
  const changed=()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>api.run(api.refresh),170);};
  for(const name of ["onCreated","onRemoved","onUpdated","onActivated","onMoved","onAttached","onDetached"])
    chrome.tabs[name].addListener(changed);
  bindCapture(api);bindSleep(api);
}
