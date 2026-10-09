import {MODE_LABELS,modeDefaultCards,normalizeCards,currentCards,replaceCurrentCards} from "./dashboard-presets.mjs";
// Local-only dashboard schema. Catalog IDs are stable feature identities.
export const DASHBOARD_KEY="datapass.edge.personal-dashboard.v1";
export const WORKSPACE_KEY="datapass.edge.workspaces.v1";
export const CATALOG=[
  {id:"quick",title:"Lancer",section:"dev",icon:"⌘",kind:"quick",span:2},
  {id:"resume",title:"Resume My Work",section:"dev",icon:"↳",kind:"resume",span:2},
  {id:"pulse",title:"Galaxy Pulse",section:"dev",icon:"◉",kind:"pulse",span:2},
  {id:"system",title:"Mon PC Windows",section:"dev",icon:"▤",kind:"system",span:1},
  {id:"attention",title:"My Attention",section:"dev",icon:"!",kind:"attention",span:1},
  {id:"norsk",title:"Norsk Daily",section:"news",icon:"Æ",kind:"norsk",span:1,url:"https://www.nrk.no/",feed:{type:"google",query:"site:nrk.no (nyheter OR teknologi OR samfunn)",lang:"no",country:"NO"}},
  {id:"discover",title:"R&D Discovery",section:"dev",icon:"◇",kind:"discover",span:1,url:"https://github.com/trending"},
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
// Public repo URLs are linkable; private project names have no repo address in public source.
export const GALAXY_TARGETS=[
  {id:"pm",label:"PM",access:"private"},
  {id:"agent",label:"Agent",repo:"julian-passebecq/datapass-agent",access:"public"},
  {id:"brain",label:"Brain",access:"private"},
  {id:"diagramcloud",label:"DiagramCloud",repo:"julian-passebecq/diagramcloud",access:"public"},
  {id:"mosaic",label:"MosaicStudio",repo:"julian-passebecq/datapass-mosaicstudio",access:"public"},
  {id:"atlasnote",label:"AtlasNote",repo:"julian-passebecq/atlasnote",access:"public"},
  {id:"browser",label:"Edge Browser",repo:"julian-passebecq/ms-edge-rust-datapass",access:"public"},
  {id:"gallery",label:"Visual Gallery",repo:"julian-passebecq/datapass-visual-gallery",access:"public"},
  {id:"factory",label:"Factory",url:"https://gitlab.com/juliandatapass-group/datapass-factory",access:"external"}
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
  try{
    const u=new URL(raw);
    if(!["https:","http:"].includes(u.protocol)||u.username||u.password)return null;
    for(const key of [...u.searchParams.keys()]){
      if(/^(access_token|id_token|refresh_token|token|api_?key|secret|password|code|state|session)$/i.test(key))u.searchParams.delete(key);
    }
    if(/access_token|id_token|refresh_token/i.test(u.hash))u.hash="";
    return u.href;
  }catch{return null;}
}
export function safeRepo(raw){return /^[A-Za-z0-9_.-]{1,80}\/[A-Za-z0-9_.-]{1,100}$/.test(String(raw))?String(raw):null;}
export function safeTicker(raw){const v=String(raw??"").toUpperCase().trim();return /^[A-Z0-9.^-]{1,16}$/.test(v)?v:null;}
export function defaultDashboard(){
  return {schemaVersion:1,section:"all",mode:"deep",
    cards:CATALOG.map((def,i)=>({id:def.id,visible:!["services"].includes(def.id),span:def.span,order:i})),
    modeLayouts:Object.fromEntries(["morning","deep","evening"].map(mode=>[mode,modeDefaultCards(mode,CATALOG)])),
    repos:[...INITIAL_REPOS],tickers:["MSFT","NVDA"],
    episodes:[
      {id:"s05e20",title:"S05E20 · Red Velvet Cupcakes",note:"Rigsby et Van Pelt : une enquête romantique et comique",url:"https://thementalist.fandom.com/wiki/Red_Velvet_Cupcakes"},
      {id:"s02e19",title:"S02E19 · Blood Money",note:"Jane se représente au tribunal : humour de prétoire",url:"https://tv.apple.com/no/episode/blood-money/umc.cmc.21ndjec049hwagvkhrczyhnk"},
      {id:"s02e06",title:"S02E06 · Black Gold and Red Blood",note:"Jane derrière les barreaux et ses échanges avec Lisbon",url:"https://www.betaseries.com/episode/thementalist/s02e06"},
      {id:"s01e17",title:"S01E17 · Carnelian, Inc.",note:"La retraite d’entreprise et les facéties de Jane",url:"https://www.tvguide.com/tvshows/the-mentalist/episodes-season-1/1030857847/"}
    ],
    fixtures:[]
  };
}
export function normalizeDashboard(raw){
  const initial=defaultDashboard();
  if(!raw||raw.schemaVersion!==1)return initial;
  // Existing V0.2 profiles have no mode: preserve their custom layout exactly.
  const mode=Object.hasOwn(MODE_LABELS,raw.mode)?raw.mode:"custom";
  const cards=normalizeCards(raw.cards,CATALOG,initial.cards);
  const modeLayouts=Object.fromEntries(["morning","deep","evening"].map(modeId=>[
    modeId,normalizeCards(raw.modeLayouts?.[modeId],CATALOG,modeDefaultCards(modeId,CATALOG))
  ]));
  const repos=[...new Set((Array.isArray(raw.repos)?raw.repos:initial.repos).map(safeRepo).filter(Boolean))].slice(0,16);
  const tickers=[...new Set((Array.isArray(raw.tickers)?raw.tickers:initial.tickers).map(safeTicker).filter(Boolean))].slice(0,16);
  const episodes=(Array.isArray(raw.episodes)?raw.episodes:initial.episodes).slice(0,25).map((ep,i)=>({
    id:clean(ep?.id,64)||"ep"+i,
    title:clean(ep?.title,120),note:clean(ep?.note,200),url:safeHttp(ep?.url)||null
  })).filter(ep=>ep.title);
  const fixtures=(Array.isArray(raw.fixtures)?raw.fixtures:[]).slice(0,150).map(e=>({
    title:clean(e?.title,120),start:typeof e?.start==="string"?e.start:null,allDay:e?.allDay===true,url:safeHttp(e?.url)
  })).filter(e=>e.title&&e.start&&!Number.isNaN(Date.parse(e.start)));
  return {schemaVersion:1,section:Object.hasOwn(SECTION_LABELS,raw.section)?raw.section:"all",mode,modeLayouts,cards,repos,tickers,episodes,fixtures};
}
export function reviseCard(raw,id,update){
  const state=normalizeDashboard(raw);
  if(!CATALOG.some(c=>c.id===id))return state;
  const next=currentCards(state).map(c=>c.id===id?{...c,...update,id}:c);
  return normalizeDashboard(replaceCurrentCards(state,next));
}
export function moveCard(raw,id,delta){
  const state=normalizeDashboard(raw);
  const cards=[...currentCards(state)],a=cards.findIndex(c=>c.id===id),b=a+delta;
  if(a<0||b<0||b>=cards.length)return state;
  [cards[a],cards[b]]=[cards[b],cards[a]];
  return normalizeDashboard(replaceCurrentCards(state,cards.map((c,i)=>({...c,order:i}))));
}
export function reorderCards(raw,fromId,toId){
  const state=normalizeDashboard(raw);
  const cards=[...currentCards(state)],from=cards.findIndex(c=>c.id===fromId),to=cards.findIndex(c=>c.id===toId);
  if(from<0||to<0||from===to)return state;
  const [item]=cards.splice(from,1);cards.splice(to,0,item);
  return normalizeDashboard(replaceCurrentCards(state,cards.map((c,i)=>({...c,order:i}))));
}
export function resetMode(raw){
  const state=normalizeDashboard(raw);
  const defaults=state.mode==="custom"?defaultDashboard().cards:modeDefaultCards(state.mode,CATALOG);
  return normalizeDashboard(replaceCurrentCards(state,defaults));
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
