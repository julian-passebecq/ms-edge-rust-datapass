import {addLink} from "./core.mjs";
import {openUrl} from "./open-url.mjs";
export function bindCapture(api){
  document.getElementById("capture").addEventListener("click",()=>api.run(async()=>{
    const all=api.getTabs();
    if(!all.length)throw Error("No web tabs to capture.");
    const id=api.selected().id;
    await api.transact(state=>all.reduce((s,t)=>addLink(s,id,{url:t.url,title:t.title}),state));
    api.show("Saved eligible URLs from current Edge window.");
  }));
  document.getElementById("restore").addEventListener("click",()=>api.run(async()=>{
    const project=api.selected(),links=project.links.slice(0,8);
    if(!links.length)throw Error("No saved links in workspace.");
    const notice=project.links.length>8?" Only the first eight will open.":"";
    if(!window.confirm("Open "+links.length+" links from "+project.name+"? This may increase RAM."+notice))return;
    for(let i=0;i<links.length;i++)await openUrl(links[i].url,i===0);
    await api.refresh();api.show("Workspace links opened or reused.");
  }));
}
