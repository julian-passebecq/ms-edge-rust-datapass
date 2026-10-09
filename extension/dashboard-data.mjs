// Local-only dashboard schema. Catalog IDs are stable feature identities.
export const DASHBOARD_KEY="datapass.edge.personal-dashboard.v1";
export const WORKSPACE_KEY="datapass.edge.workspaces.v1";
export const CATALOG=[
  {id:"quick",title:"Lancer",section:"dev",icon:"⌘",kind:"quick",span:2},
  {id:"tech-no",title:"Data & IT · Norge",section:"news",icon:"⌁",kind:"feed",span:2,url:"https://www.digi.no/",feed:{type:"google",query:"(site:digi.no OR site:kode24.no OR site:tu.no) (data OR IT OR kunstig intelligens)",lang:"no",country:"NO"}},
  {id:"bbc-world",title:"BBC · World",section:"news",icon:"◎",kind:"feed",span:1,url:"https://www.bbc.com/news/world",feed:{type:"rss",url:"https://feeds.bbci.co.uk/news/world/rss.xml"}},
  {id:"bfm",title:"BFM TV",section:"news",icon:"●",kind:"feed",span:1,url:"https://www.bfmtv.com/",feed:{type:"google",query:"site:bfmtv.com",lang:"fr",country:"FR"}},
  {id:"bfm-business",title:"BFM Business",section:"news",icon:"◈",kind:"feed",span:1,url:"https://www.bfmtv.com/economie/",feed:{type:"google",query:"site:bfmbusiness.bfmtv.com OR site:bfmtv.com/economie",lang:"fr",country:"FR"}},
  {id:"cnn",title:"CNN · World",section:"news",icon:"◉",kind:"feed",span:1,url:"https://edition.cnn.com/world",feed:{type:"google",query:"site:cnn.com world",lang:"en",country:"US"}},
  {id:"city",title:"Manchester City",section:"leisure",icon:"⚽",kind:"city",span:2,url:"https://www.mancity.com/fixtures/",feed:{type:"google",query:"Manchester City fixture upcoming Liverpool Champions League",lang:"en",country:"GB"}},
  {id:"f1",title:"Formula 1",section:"leisure",icon:"◫",kind:"feed",span:1,url:"https://www.formula1.com/en/latest",feed:{type:"rss",url:"https://feeds.bbci.co.uk/sport/formula1/rss.xml"}},
  {id:"netflix",title:"Netflix · Séries",section:"leisure",icon:"▶",kind:"netflix",span:2,url:"https://www.netflix.com/tudum/topics/news/all",feed:{type:"google",query:"site:netflix.com/tudum new series release 3 Body Problem",lang:"en",country:"US"}},
  {id:"mentalist",title:"The Mentalist · épisodes",section:"leisure",icon:"✦",kind:"mentalist",span:1,url:"https://en.wikipedia.org/wiki/List_of_The_Mentalist_episodes"},
  {id:"gaming",title:"Jeuxvideo.com · Tests",section:"leisure",icon:"▣",kind:"feed",span:2,url:"https://www.jeuxvideo.com/tests.htm",feed:{type:"google",query:"site:jeuxvideo.com/test/ jeu vidéo test",lang:"fr",country:"FR"}},
  {id:"finance",title:"Yahoo Finance",section:"news",icon:"↗",kind:"finance",span:1,url:"https://finance.yahoo.com/"},
  {id:"gmail",title:"Gmail",section:"dev",icon:"✉",kind:"gmail",span:1,url:"https://mail.google.com/mail/u/0/"},
  {id:"repos",title:"GitHub · mes repos",section:"dev",icon:"◇",kind:"repos",span:2,url:"https://github.com/julian-passebecq?tab=repositories"},
  {id:"quota",title:"IT · quotas & CI/CD",section:"dev",icon:"▥",kind:"quota",span:2,url:"https://github.com/settings/billing"},
  {id:"services",title:"Cloud · services",section:"dev",icon:"☁",kind:"services",span:1,url:"https://dash.cloudflare.com/"}
];
export const SECTION_LABELS={all:"Tout",news:"Actualités",leisure:"Loisirs",dev:"Développement"};
export const SHORTCUTS=[
  {id:"chatgpt",title:"Nouveau ChatGPT",url:"https://chatgpt.com/"},
  {id:"claude",title:"Nouveau Claude",url:"https://claude.ai/new"},
  {id:"mongo",title:"MongoDB Atlas",url:"https://cloud.mongodb.com/"},
  {id:"atlasnote",title:"AtlasNote (repo)",url:"https://github.com/julian-passebecq/atlasnote"},
  {id:"github",title:"Nouveau repo",url:"https://github.com/new"},
  {id:"cloudflare",title:"Cloudflare",url:"https://dash.cloudflare.com/"}
];
export const SERVICE_LINKS=[
  {title:"Cloudflare · billing",url:"https://dash.cloudflare.com/"},
  {title:"Cloudflare · R2",url:"https://dash.cloudflare.com/"},
  {title:"GitHub Actions · billing",url:"https://github.com/settings/billing"},
  {title:"GitHub · workflows",url:"https://github.com/julian-passebecq/ms-edge-rust-datapass/actions"},
  {title:"Netlify",url:"https://app.netlify.com/"},
  {title:"MongoDB Atlas",url:"https://cloud.mongodb.com/"},
  {title:"Vercel",url:"https://vercel.com/dashboard"}
];
export const INITIAL_REPOS=[
  "julian-passebecq/ms-edge-rust-datapass",
  "julian-passebecq/atlasnote",
  "julian-passebecq/diagramcloud",
  "julian-passebecq/datapass-mosaicstudio",
  "julian-passebecq/datapass-visual-gallery"
];
export function clean(value,max=130){return String(value??"").replace(/[\x00-\x1f\x7f]/g," ").trim().slice(0,max);}
export function safeHttp(raw){
  try{const u=new URL(raw);return (["https:","http:"].includes(u.protocol)&&!u.username&&!u.password)?u.href:null;}catch{return null;}
}
export function safeRepo(raw){return /^[A-Za-z0-9_.-]{1,80}\/[A-Za-z0-9_.-]{1,100}$/.test(String(raw))?String(raw):null;}
export function safeTicker(raw){const v=String(raw??"").toUpperCase().trim();return /^[A-Z0-9.^-]{1,16}$/.test(v)?v:null;}
export function defaultDashboard(){
  return {schemaVersion:1,section:"all",
    cards:CATALOG.map((def,i)=>({id:def.id,visible:!["services"].includes(def.id),span:def.span,order:i})),
    repos:[...INITIAL_REPOS],tickers:["MSFT","NVDA"],
    episodes:[{id:"s05e20",title:"S05E20 · Red Velvet Cupcakes",note:"Enquête radio et duo Rigsby / Van Pelt",url:"https://thementalist.fandom.com/wiki/Red_Velvet_Cupcakes"}],
    fixtures:[]
  };
}
export function normalizeDashboard(raw){
  const initial=defaultDashboard();
  if(!raw||raw.schemaVersion!==1)return initial;
  const entries=new Map((Array.isArray(raw.cards)?raw.cards:[]).filter(x=>x&&typeof x==="object").map(x=>[x.id,x]));
  const cards=CATALOG.map((d,i)=>{
    const value=entries.get(d.id);
    return {id:d.id,visible:value?value.visible!==false:initial.cards[i].visible,
      span:value&&[1,2,3].includes(value.span)?value.span:d.span,
      order:value&&Number.isSafeInteger(value.order)&&value.order>=0&&value.order<=10000?value.order:i};
  }).sort((a,b)=>a.order-b.order).map((v,i)=>({...v,order:i}));
  const repos=[...new Set((Array.isArray(raw.repos)?raw.repos:initial.repos).map(safeRepo).filter(Boolean))].slice(0,16);
  const tickers=[...new Set((Array.isArray(raw.tickers)?raw.tickers:initial.tickers).map(safeTicker).filter(Boolean))].slice(0,16);
  const episodes=(Array.isArray(raw.episodes)?raw.episodes:initial.episodes).slice(0,25).map((ep,i)=>({
    id:clean(ep?.id,64)||"ep"+i,
    title:clean(ep?.title,120),note:clean(ep?.note,200),url:safeHttp(ep?.url)||null
  })).filter(ep=>ep.title);
  const fixtures=(Array.isArray(raw.fixtures)?raw.fixtures:[]).slice(0,150).map(e=>({
    title:clean(e?.title,120),start:typeof e?.start==="string"?e.start:null,allDay:e?.allDay===true,url:safeHttp(e?.url)
  })).filter(e=>e.title&&e.start&&!Number.isNaN(Date.parse(e.start)));
  return {schemaVersion:1,section:Object.hasOwn(SECTION_LABELS,raw.section)?raw.section:"all",cards,repos,tickers,episodes,fixtures};
}
export function reviseCard(raw,id,update){
  const s=normalizeDashboard(raw);
  if(!CATALOG.some(c=>c.id===id))return s;
  s.cards=s.cards.map(c=>c.id===id?{...c,...update,id}:c);
  return normalizeDashboard(s);
}
export function moveCard(raw,id,delta){
  const s=normalizeDashboard(raw),a=s.cards.findIndex(c=>c.id===id),b=a+delta;
  if(a<0||b<0||b>=s.cards.length)return s;
  [s.cards[a],s.cards[b]]=[s.cards[b],s.cards[a]];
  s.cards=s.cards.map((c,i)=>({...c,order:i}));
  return s;
}
export function feedUrl(feed){
  if(feed.type==="rss")return feed.url;
  const q=new URL("https://news.google.com/rss/search");
  q.searchParams.set("q",feed.query);
  q.searchParams.set("hl",feed.lang);
  q.searchParams.set("gl",feed.country);
  q.searchParams.set("ceid",feed.country+":"+feed.lang);
  return q.href;
}
