import {GALAXY_TARGETS,safeHttp,clean} from "./dashboard-data.mjs";

const HOSTS=new Set(["chatgpt.com","chat.openai.com","claude.ai","github.com","gitlab.com"]);
export function isWorkUrl(raw){
  const url=safeHttp(raw);if(!url)return false;
  return HOSTS.has(new URL(url).hostname.toLowerCase());
}
export function resumeCandidates(workspaces,tabs,closed=[]){
  const result=[],seen=new Set();
  const put=(entry)=>{
    const url=safeHttp(entry.url);
    if(!url||!isWorkUrl(url)||seen.has(url))return;
    seen.add(url);
    result.push({...entry,url,title:clean(entry.title,100)||new URL(url).hostname});
  };
  const live=[...tabs].filter(t=>isWorkUrl(t.url)).sort((a,b)=>(b.lastAccessed||0)-(a.lastAccessed||0));
  for(const tab of live){
    put({kind:"open",id:String(tab.id),title:tab.title,url:tab.url,
      observedAt:Number.isFinite(tab.lastAccessed)?tab.lastAccessed:null});
  }
  for(const group of workspaces.projects||[]){
    for(const link of [...(group.links||[])].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))){
      put({kind:"saved",title:link.title,url:link.url,workspace:clean(group.name,80)});
    }
  }
  for(const item of closed){
    if(!item||typeof item.sessionId!=="string")continue;
    put({kind:"closed",id:item.sessionId,title:item.title,url:item.url,
      observedAt:Number.isFinite(item.lastModified)?item.lastModified*1000:null});
  }
  return result.slice(0,12);
}
export function normalizedClosedSessions(records){
  const result=[];
  for(const s of Array.isArray(records)?records:[]){
    if(!s?.tab?.url||typeof s.tab.sessionId!=="string")continue;
    if(!isWorkUrl(s.tab.url))continue;
    result.push({sessionId:s.tab.sessionId,url:s.tab.url,title:s.tab.title||"Onglet fermé",
      lastModified:Number.isFinite(s.lastModified)?s.lastModified:null});
  }
  return result.slice(0,20);
}
export function galaxyPulseRows(statuses){
  return GALAXY_TARGETS.map(target=>{
    const observed=target.repo&&target.access==="public"?statuses.get(target.repo):null;
    return {...target,ci:observed||null,
      observation:observed?"public-ci":
        target.access==="private"?"private-unavailable":
        target.access==="external"?"external-unavailable":"not-checked"};
  });
}
export function attentionSummary(statuses){
  const rows=galaxyPulseRows(statuses);
  const observed=rows.filter(r=>r.observation==="public-ci"&&r.ci?.status!=="indisponible");
  const failures=observed.filter(r=>["failure","timed_out","cancelled","action_required"].includes(r.ci?.status));
  const pending=observed.filter(r=>["in_progress","queued","waiting","pending","requested"].includes(r.ci?.status));
  return {failures,pending,observedCount:observed.length,total:rows.length};
}
export function displayTimestamp(raw){
  const value=typeof raw==="number"?raw:Date.parse(raw);
  if(!Number.isFinite(value))return "heure indisponible";
  return new Date(value).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"});
}
