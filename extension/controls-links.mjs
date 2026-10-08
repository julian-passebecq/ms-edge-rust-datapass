import {addLink,renameLink,removeLink,safeUrl} from "./core.mjs";
import {bindLinkDrag} from "./controls-drag.mjs";
import {openUrl} from "./open-url.mjs";
const $=id=>document.getElementById(id);
export function bindLinks(api){
  $("add-link").addEventListener("click",()=>{$("link-form").hidden=false;$("link-url").focus();});
  $("cancel-link").addEventListener("click",()=>{$("link-form").hidden=true;});
  $("link-form").addEventListener("submit",event=>{
    event.preventDefault();api.run(async()=>{
      await api.transact(s=>addLink(s,api.selected().id,{title:$("link-title").value,url:$("link-url").value}));
      $("link-form").reset();$("link-form").hidden=true;api.show("Link saved.");
    });
  });
  $("projects").addEventListener("click",event=>{
    const b=event.target.closest("button[data-action]");
    if(!b||!b.dataset.action.endsWith("link"))return;
    api.run(async()=>{
      const {action,project:pid,link:lid}=b.dataset;
      const item=api.getState().projects.find(p=>p.id===pid)?.links.find(l=>l.id===lid);
      if(action==="open-link"&&item){await openUrl(item.url,true);await api.refresh();}
      if(action==="rename-link"&&item){
        const title=window.prompt("Saved link title",item.title);
        if(title?.trim())await api.transact(s=>renameLink(s,pid,lid,title));
      }
      if(action==="remove-link")await api.transact(s=>removeLink(s,pid,lid));
    });
  });
  bindLinkDrag(api);
}
