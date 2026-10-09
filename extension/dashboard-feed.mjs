import {feedUrl,safeHttp,safeRepo,clean} from "./dashboard-data.mjs";
const ORIGINS=new Set(["https://news.google.com","https://feeds.bbci.co.uk","https://api.github.com"]);
async function fetchWithLimit(url,signal){
  const response=await fetch(url,{method:"GET",credentials:"omit",cache:"no-store",redirect:"follow",signal,
    headers:{Accept:"application/rss+xml, application/atom+xml, application/xml, application/json, text/xml"}});
  if(!response.ok)throw Error("HTTP "+response.status);
  const length=Number(response.headers.get("content-length")||0);
  if(length>1200000)throw Error("Remote response too large");
  const text=await response.text();
  if(text.length>1200000)throw Error("Remote response too large");
  return text;
}
export async function requestSource(origin){
  if(!ORIGINS.has(origin))throw Error("Source host not allowlisted.");
  return chrome.permissions.request({origins:[origin+"/*"]});
}
export async function fetchPublicFeed(feed){
  const url=feedUrl(feed);
  const allowed=new URL(url);
  if(!ORIGINS.has(allowed.origin))throw Error("Source not allowlisted.");
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),10000);
  try{return parseFeed(await fetchWithLimit(url,controller.signal));}
  finally{clearTimeout(timer);}
}
export function parseFeed(xml){
  const doc=new DOMParser().parseFromString(xml,"application/xml");
  if(doc.querySelector("parsererror"))throw Error("Invalid XML feed");
  const nodes=[...doc.querySelectorAll("item, entry")].slice(0,40);
  const rows=[];
  const unique=new Set();
  for(const node of nodes){
    const title=clean(node.querySelector("title")?.textContent,220);
    const direct=node.querySelector("link")?.getAttribute("href");
    const url=safeHttp(direct||node.querySelector("link")?.textContent);
    const rawDate=node.querySelector("pubDate, published, updated")?.textContent;
    const timestamp=rawDate&&!Number.isNaN(Date.parse(rawDate))?new Date(rawDate).toISOString():null;
    if(!title||!url||unique.has(url))continue;
    unique.add(url);
    rows.push({title,url,publishedAt:timestamp});
    if(rows.length===6)break;
  }
  if(!rows.length)throw Error("Feed has no readable articles.");
  return rows;
}
export async function fetchRepositoryStatus(repo){
  if(!safeRepo(repo))throw Error("Invalid public repository.");
  const url="https://api.github.com/repos/"+repo+"/actions/runs?per_page=1";
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9500);
  try{
    const parsed=JSON.parse(await fetchWithLimit(url,controller.signal));
    const run=Array.isArray(parsed.workflow_runs)?parsed.workflow_runs[0]:null;
    return run?{
      status:clean(run.conclusion||run.status||"unknown",35),
      sha:clean(run.head_sha,40).slice(0,7),
      name:clean(run.name,90),
      url:safeHttp(run.html_url),
      observedAt:new Date().toISOString()
    }:{status:"no-runs",sha:null,name:null,url:null,observedAt:new Date().toISOString()};
  }finally{clearTimeout(timer);}
}
export function isoFromIcs(raw){
  if(typeof raw!=="string")return null;
  const value=raw.trim();
  if(/^\d{8}$/.test(value)){
    const out=value.slice(0,4)+"-"+value.slice(4,6)+"-"+value.slice(6,8)+"T12:00:00.000Z";
    return Number.isNaN(Date.parse(out))?null:out;
  }
  if(/^\d{8}T\d{6}Z$/.test(value)){
    const out=value.slice(0,4)+"-"+value.slice(4,6)+"-"+value.slice(6,8)+"T"+
      value.slice(9,11)+":"+value.slice(11,13)+":"+value.slice(13,15)+".000Z";
    return Number.isNaN(Date.parse(out))?null:out;
  }
  // Floating/local and TZID times require timezone disambiguation; never guess.
  return null;
}
export function parseIcs(text){
  if(typeof text!=="string"||text.length>2000000)throw Error("Calendar file too large.");
  const records=text.replace(/\r\n/g,"\n").replace(/\n[ \t]/g,"").split("\n");
  const result=[];let item=null;
  for(const record of records){
    const line=record.trim();
    if(line==="BEGIN:VEVENT"){item={};continue;}
    if(line==="END:VEVENT"){
      if(item?.title&&item.start)result.push(item);
      item=null;continue;
    }
    if(!item)continue;
    const separator=line.indexOf(":");
    if(separator<0)continue;
    const key=line.slice(0,separator).toUpperCase();
    const value=line.slice(separator+1).replace(/\\[nN]/g," ").replace(/\\[,;]/g,match=>match.slice(1));
    if(key==="SUMMARY")item.title=clean(value,120);
    if(key==="URL")item.url=safeHttp(value);
    if(key==="DTSTART"||key==="DTSTART;VALUE=DATE")item.start=isoFromIcs(value);
  }
  return result.slice(0,150).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));
}
export function latestAvailable(fixtures,now=Date.now()){
  return fixtures.filter(e=>Date.parse(e.start)>=now-3600000).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start)).slice(0,4);
}
