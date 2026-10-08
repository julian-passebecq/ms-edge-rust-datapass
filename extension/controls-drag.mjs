import {reorderLink} from "./core.mjs";
export function bindLinkDrag(api){
  const list=document.getElementById("projects");
  let selected=null;
  list.addEventListener("dragstart",event=>{
    const row=event.target.closest("[data-link-row]");
    if(!row)return;
    selected={project:row.dataset.project,link:row.dataset.link};
    event.dataTransfer.effectAllowed="move";
    event.dataTransfer.setData("text/plain",selected.link);
  });
  list.addEventListener("dragover",event=>{
    if(selected&&event.target.closest("[data-link-row]"))event.preventDefault();
  });
  list.addEventListener("drop",event=>{
    const row=event.target.closest("[data-link-row]");
    if(!row||!selected||row.dataset.project!==selected.project)return;
    event.preventDefault();
    const source=selected;selected=null;
    api.run(()=>api.transact(s=>reorderLink(s,source.project,source.link,row.dataset.link)));
  });
  list.addEventListener("dragend",()=>{selected=null;});
}
