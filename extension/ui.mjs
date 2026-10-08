import {safeUrl} from "./core.mjs";
const $=id=>document.getElementById(id);
function element(tag,cls,text){
  const x=document.createElement(tag);
  if(cls)x.className=cls;
  if(text!==undefined)x.textContent=String(text);
  return x;
}
function button(text,action,attrs={},cls="mini-action"){
  const x=element("button",cls,text);
  x.type="button";x.dataset.action=action;
  for(const [k,v] of Object.entries(attrs))x.dataset[k]=String(v);
  return x;
}
function includes(q,...parts){return parts.some(s=>String(s||"").toLowerCase().includes(q));}
export function render(state,tabs) {
  const q=$("search").value.toLowerCase().trim();
  $("loaded-count").textContent=String(tabs.filter(t=>!t.discarded).length);
  $("sleep-count").textContent=String(tabs.filter(t=>t.discarded).length);
  $("tabs-count").textContent=String(tabs.length);
  $("save-tab").disabled=!tabs.some(t=>t.active);
  $("sleep").disabled=!tabs.some(t=>!t.active&&!t.discarded&&!t.audible&&!t.pinned&&t.status!=="loading");
  const urlSet=new Set(tabs.map(t=>safeUrl(t.url)));
  const projectList=$("projects");projectList.replaceChildren();
  for(const p of state.projects){
    const links=p.links.filter(l=>includes(q,l.title,l.url));
    if(q&&!includes(q,p.name)&&!links.length)continue;
    const section=element("section","project"+(p.id===state.activeProjectId?" active":""));
    const bar=element("div","project-bar");
    const open=q||!p.collapsed;
    bar.append(button(open?"▾":"▸","toggle-project",{project:p.id}));
    const choose=button("","select-project",{project:p.id},"project-select");
    choose.setAttribute("aria-pressed",String(p.id===state.activeProjectId));
    choose.append(element("span","folder-symbol","▣"),element("span","project-name",p.name),element("span","project-count",p.links.length));
    bar.append(choose,button("✎","rename-project",{project:p.id}),button("×","remove-project",{project:p.id}));
    section.append(bar);
    if(open){
      const childList=element("div","link-list");
      for(const l of (q&&!includes(q,p.name)?links:p.links)){
        const row=element("div","link-row");
        row.draggable=true;row.dataset.linkRow="1";row.dataset.project=p.id;row.dataset.link=l.id;
        const target=button("","open-link",{project:p.id,link:l.id},"open-link");
        target.title=l.url;
        target.append(element("span","link-mark"+(urlSet.has(l.url)?" live":"")),element("span","link-title",l.title));
        row.append(target,button("✎","rename-link",{project:p.id,link:l.id}),button("×","remove-link",{project:p.id,link:l.id}));
        childList.append(row);
      }
      if(!childList.childElementCount)childList.append(element("p","empty","No saved links. Add a tab to this workspace."));
      section.append(childList);
    }
    projectList.append(section);
  }
  if(!projectList.childElementCount)projectList.append(element("p","empty","No matching workspaces."));
  const openTabs=$("open-tabs");openTabs.replaceChildren();
  for(const tab of tabs){
    if(!includes(q,tab.title,tab.url))continue;
    const host=new URL(safeUrl(tab.url)).hostname;
    const row=element("div","tab-row"+(tab.active?" is-active":"")+(tab.discarded?" is-discarded":""));
    const active=button("","activate-tab",{tab:tab.id},"open-tab");
    active.title=tab.url;
    const copy=element("span","tab-copy",tab.title||host);
    copy.append(element("small","",host));
    active.append(element("span","tab-symbol",tab.discarded?"◌":tab.active?"●":"○"),copy);
    row.append(active,button("+ Save","save-open-tab",{tab:tab.id},"tab-action"));
    openTabs.append(row);
  }
  if(!openTabs.childElementCount)openTabs.append(element("p","empty","No matching web tabs in this window."));
}
