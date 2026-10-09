import {CATALOG,defaultDashboard,reviseCard,moveCard,safeTicker,safeRepo,safeHttp,clean,WORKSPACE_KEY} from "./dashboard-data.mjs";
import {parseIcs} from "./dashboard-feed.mjs";
import {addLink,normalizeState} from "./core.mjs";
const $=id=>document.getElementById(id);
export function bindDashboardActions(ctx){
  let dragging=null;
  const dispatch=(act,args,fn)=>ctx.run(()=>fn(args));
  document.addEventListener("click",event=>{
    const b=event.target.closest("[data-action]");if(!b)return;
    const id=b.dataset.id;
    const commands={
      "set-section":()=>ctx.mutate(s=>({...s,section:b.dataset.section})),
      "hide-card":()=>ctx.mutate(s=>reviseCard(s,id,{visible:false})),
      "move-up":()=>ctx.mutate(s=>moveCard(s,id,-1)),
      "move-down":()=>ctx.mutate(s=>moveCard(s,id,1)),
      "resize-card":()=>ctx.mutate(s=>{
        const current=s.cards.find(c=>c.id===id);
        return reviseCard(s,id,{span:(current.span%3)+1});
      }),
      "new-chatgpt":()=>chrome.tabs.create({url:"https://chatgpt.com/",active:true}),
      "new-claude":()=>chrome.tabs.create({url:"https://claude.ai/new",active:true}),
      "open-mongo":()=>ctx.open("https://cloud.mongodb.com/"),
      "open-conversation":()=>ctx.open(b.dataset.url),
      "save-conversation":async()=>{
        const url=safeHttp(b.dataset.url);
        if(!url)throw Error("Lien de conversation non valide.");
        const stored=(await chrome.storage.local.get(WORKSPACE_KEY))[WORKSPACE_KEY];
        const workspaces=normalizeState(stored);
        const projectId=workspaces.activeProjectId;
        const next=addLink(workspaces,projectId,{url,title:clean(b.dataset.title)});
        await chrome.storage.local.set({[WORKSPACE_KEY]:next});
        await ctx.reloadWorkspaces();
        ctx.show("Conversation enregistrée dans "+next.projects.find(p=>p.id===projectId).name);
      },
      "add-repo":async()=>{
        const raw=window.prompt("Dépôt GitHub (propriétaire/nom) :","julian-passebecq/");
        if(raw===null)return;
        const repo=safeRepo(raw.trim());
        if(!repo)throw Error("Format propriétaire/nom incorrect.");
        await ctx.mutate(s=>({...s,repos:[...new Set([...s.repos,repo])].slice(0,16)}));
      },
      "remove-repo":()=>ctx.mutate(s=>({...s,repos:s.repos.filter(x=>x!==b.dataset.repo)})),
      "add-ticker":async()=>{
        const raw=window.prompt("Symbole Yahoo Finance :", "");
        if(raw===null)return;
        const ticker=safeTicker(raw);
        if(!ticker)throw Error("Symbole invalide.");
        await ctx.mutate(s=>({...s,tickers:[...new Set([...s.tickers,ticker])].slice(0,16)}));
      },
      "remove-ticker":()=>ctx.mutate(s=>({...s,tickers:s.tickers.filter(x=>x!==b.dataset.ticker)})),
      "add-episode":async()=>{
        const title=window.prompt("Épisode (ex. S02E12 · titre) :", "");
        if(!title?.trim())return;
        const note=window.prompt("Pourquoi est-il amusant ? (facultatif) :","")||"";
        await ctx.mutate(s=>({...s,episodes:[...s.episodes,{
          id:"ep"+crypto.randomUUID(),title:clean(title,120),note:clean(note,200),url:null
        }].slice(0,25)}));
      },
      "remove-episode":()=>ctx.mutate(s=>({...s,episodes:s.episodes.filter((_,i)=>i!==Number(b.dataset.index))})),
      "import-ics":()=>{$("calendar-file").click();}
    };
    if(b.dataset.action==="refresh-feed"){void ctx.refreshFeed(id);return;}
    if(b.dataset.action==="refresh-repos"){void ctx.refreshRepos();return;}
    const fn=commands[b.dataset.action];if(fn)ctx.run(fn);
  });
  $("refresh-visible").addEventListener("click",()=>{void ctx.refreshVisible();});
  $("manage").addEventListener("click",()=>$("manage-dialog").showModal());
  $("empty-manage").addEventListener("click",()=>$("manage-dialog").showModal());
  $("close-manage").addEventListener("click",()=>$("manage-dialog").close());
  $("save-layout").addEventListener("click",()=>$("manage-dialog").close());
  $("reset-layout").addEventListener("click",()=>ctx.run(async()=>{
    if(!window.confirm("Réinitialiser seulement les cartes et leur ordre ? Tes favoris restent enregistrés."))return;
    await ctx.mutate(s=>({...s,cards:defaultDashboard().cards,section:"all"}));
  }));
  $("widget-catalog").addEventListener("change",event=>{
    const target=event.target;
    if(target.dataset.action!=="toggle-card")return;
    ctx.run(()=>ctx.mutate(s=>reviseCard(s,target.dataset.id,{visible:target.checked})));
  });
  $("toggle-rail").addEventListener("click",()=>document.querySelector(".rail").classList.toggle("shown"));
  $("open-sidebar").addEventListener("click",()=>{
    // Native Edge side panel opening requires explicit interaction.
    void chrome.sidePanel.open({windowId:chrome.windows.WINDOW_ID_CURRENT}).catch(()=>ctx.show("Pour ouvrir la sidebar, clique sur l'icône DataPass dans Edge."));
  });
  $("calendar-file").addEventListener("change",event=>ctx.run(async()=>{
    const file=event.target.files?.[0];if(!file)return;
    try{
      if(file.size>2000000)throw Error("Fichier calendrier supérieur à 2 Mo.");
      const events=parseIcs(await file.text());
      if(!events.length)throw Error("Aucun match importable : seuls les horaires UTC et les dates simples sont acceptés. Vérifie la source du .ics.");
      if(!window.confirm("Importer "+events.length+" événements à la place du calendrier local actuel ?"))return;
      await ctx.mutate(s=>({...s,fixtures:events}));
      ctx.show(events.length+" rencontres importées. Vérifie leurs horaires avec la source officielle.");
    }finally{event.target.value="";}
  }));
  const grid=$("cards");
  grid.addEventListener("dragstart",event=>{
    const card=event.target.closest(".card");
    if(!card)return;
    dragging=card.dataset.id;
    card.classList.add("dragging");
    event.dataTransfer.effectAllowed="move";
    event.dataTransfer.setData("text/plain",dragging);
  });
  grid.addEventListener("dragover",event=>{
    const card=event.target.closest(".card");
    if(!card||!dragging)return;
    event.preventDefault();card.classList.add("drag-over");
  });
  grid.addEventListener("dragleave",event=>{
    const card=event.target.closest(".card");if(card)card.classList.remove("drag-over");
  });
  grid.addEventListener("drop",event=>{
    const target=event.target.closest(".card");
    if(!dragging||!target||dragging===target.dataset.id)return;
    event.preventDefault();
    const source=dragging,destination=target.dataset.id;dragging=null;
    ctx.run(()=>ctx.mutate(s=>{
      const cards=[...s.cards],from=cards.findIndex(c=>c.id===source),to=cards.findIndex(c=>c.id===destination);
      if(from<0||to<0)return s;
      const [item]=cards.splice(from,1);cards.splice(to,0,item);
      return {...s,cards:cards.map((c,i)=>({...c,order:i}))};
    }));
  });
  grid.addEventListener("dragend",()=>{
    dragging=null;for(const card of grid.querySelectorAll(".card"))card.classList.remove("drag-over","dragging");
  });
}
