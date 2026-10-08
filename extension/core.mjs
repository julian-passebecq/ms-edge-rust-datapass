// DataPass V1: pure, local-only workspace model.
export function cleanText(value,fallback="Untitled",max=120) {
  const text=typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g," ").trim():"";
  return (text||fallback).slice(0,max);
}
export function safeUrl(raw) {
  if(typeof raw!=="string"||raw.length>4096)return null;
  try {
    const url=new URL(raw);
    if(!["http:","https:"].includes(url.protocol)||url.username||url.password)return null;
    for(const key of [...url.searchParams.keys()]){
      if(/^(access_token|id_token|refresh_token|token|api_?key|secret|password|code|state|session)$/i.test(key))url.searchParams.delete(key);
    }
    if(/access_token|id_token|refresh_token/i.test(url.hash))url.hash="";
    return url.href;
  } catch { return null; }
}
function makeId(prefix){return prefix+"_"+crypto.randomUUID().replace(/-/g,"");}
export function initialState(){
  return {schemaVersion:1,activeProjectId:"galaxy",projects:[
    {id:"galaxy",name:"Galaxy",collapsed:false,links:[]},
    {id:"atlasnote",name:"AtlasNote",collapsed:false,links:[{id:"atlas-repo",title:"AtlasNote source repository",url:"https://github.com/julian-passebecq/atlasnote",createdAt:0}]},
    {id:"research",name:"Research",collapsed:false,links:[]}
  ]};
}
export function normalizeState(raw){
  if(!raw||raw.schemaVersion!==1||!Array.isArray(raw.projects))return initialState();
  const projectIds=new Set();
  const projects=raw.projects.slice(0,30).filter(p=>p&&typeof p==="object").map(p=>{
    let id=cleanText(p.id,"",90);
    if(!/^[a-zA-Z0-9_-]{1,90}$/.test(id)||projectIds.has(id))id=makeId("p");
    projectIds.add(id);
    const seenUrls=new Set(),seenIds=new Set();
    const links=(Array.isArray(p.links)?p.links:[]).slice(0,150).map(item=>{
      const url=safeUrl(item?.url);
      if(!url||seenUrls.has(url))return null;
      seenUrls.add(url);
      let linkId=cleanText(item?.id,"",90);
      if(!/^[a-zA-Z0-9_-]{1,90}$/.test(linkId)||seenIds.has(linkId))linkId=makeId("l");
      seenIds.add(linkId);
      return {id:linkId,title:cleanText(item?.title,new URL(url).hostname,120),
        url,createdAt:Number.isFinite(item?.createdAt)?item.createdAt:Date.now()};
    }).filter(Boolean);
    return {id,name:cleanText(p.name,"Workspace",60),collapsed:!!p.collapsed,links};
  });
  if(!projects.length)return initialState();
  return {schemaVersion:1,
    activeProjectId:projects.some(p=>p.id===raw.activeProjectId)?raw.activeProjectId:projects[0].id,
    projects};
}
export function addProject(raw,name){
  const state=normalizeState(raw);
  if(state.projects.length>=30)throw Error("Maximum 30 workspaces.");
  const project={id:makeId("p"),name:cleanText(name,"Workspace",60),collapsed:false,links:[]};
  return {...state,activeProjectId:project.id,projects:[...state.projects,project]};
}
export function renameProject(raw,id,name){
  const state=normalizeState(raw);
  return {...state,projects:state.projects.map(p=>p.id===id?{...p,name:cleanText(name,p.name,60)}:p)};
}
export function removeProject(raw,id){
  const state=normalizeState(raw);
  if(state.projects.length<=1)throw Error("Keep at least one workspace.");
  const projects=state.projects.filter(p=>p.id!==id);
  return {...state,projects,activeProjectId:projects.some(p=>p.id===state.activeProjectId)?state.activeProjectId:projects[0].id};
}
export function selectProject(raw,id){
  const state=normalizeState(raw);
  return state.projects.some(p=>p.id===id)?{...state,activeProjectId:id}:state;
}
export function toggleProject(raw,id){
  const state=normalizeState(raw);
  return {...state,projects:state.projects.map(p=>p.id===id?{...p,collapsed:!p.collapsed}:p)};
}
export function addLink(raw,projectId,input){
  const state=normalizeState(raw);
  const url=safeUrl(input?.url);
  if(!url)throw Error("Only http(s) links without embedded credentials are supported.");
  if(!state.projects.some(p=>p.id===projectId))throw Error("Workspace not found.");
  const projects=state.projects.map(p=>{
    if(p.id!==projectId||p.links.some(l=>l.url===url))return p;
    if(p.links.length>=150)throw Error("Maximum 150 links per workspace.");
    return {...p,links:[...p.links,{id:makeId("l"),url,
      title:cleanText(input?.title,new URL(url).hostname,120),createdAt:Date.now()}]};
  });
  return {...state,projects};
}
export function renameLink(raw,projectId,linkId,name){
  const state=normalizeState(raw);
  return {...state,projects:state.projects.map(p=>p.id===projectId?
    {...p,links:p.links.map(l=>l.id===linkId?{...l,title:cleanText(name,l.title,120)}:l)}:p)};
}
export function removeLink(raw,projectId,linkId){
  const state=normalizeState(raw);
  return {...state,projects:state.projects.map(p=>p.id===projectId?
    {...p,links:p.links.filter(l=>l.id!==linkId)}:p)};
}
export function reorderLink(raw,projectId,sourceId,targetId){
  const state=normalizeState(raw);
  return {...state,projects:state.projects.map(p=>{
    if(p.id!==projectId||sourceId===targetId)return p;
    const links=[...p.links],from=links.findIndex(l=>l.id===sourceId),to=links.findIndex(l=>l.id===targetId);
    if(from<0||to<0)return p;
    const [moved]=links.splice(from,1);
    links.splice(to,0,moved);
    return {...p,links};
  })};
}
export function parseBackup(content){
  const obj=typeof content==="string"?JSON.parse(content):content;
  if(!obj||obj.schemaVersion!==1||!Array.isArray(obj.projects)||obj.projects.length<1||obj.projects.length>30)
    throw Error("Unsupported or invalid DataPass workspace backup.");
  return normalizeState(obj);
}
