import {GALAXY_TARGETS} from "./dashboard-data.mjs";
import {node,action,external,paragraph,capsule} from "./dashboard-dom.mjs";
import {resumeCandidates,galaxyPulseRows,attentionSummary,displayTimestamp} from "./dashboard-recovery.mjs";

function buttons(...values){const el=node("div","card-actions");el.append(...values);return el;}
function humanBytes(value){
  if(!Number.isFinite(value)||value<0)return "inconnu";
  return (value/1073741824).toLocaleString("fr-FR",{maximumFractionDigits:1})+" Go";
}
function resumeView(ctx){
  const wrap=node("div","cockpit-stack");
  wrap.append(paragraph("Reprise fondée uniquement sur tes onglets Edge, liens sauvegardés et derniers onglets fermés autorisés. Aucune conversation n’est lue.","callout status"));
  const rows=resumeCandidates(ctx.workspaces,ctx.tabs,ctx.closedSessions);
  const list=node("div","cockpit-list");
  for(const item of rows.slice(0,8)){
    const row=node("div","cockpit-row");
    const main=node("div","cockpit-main");
    main.append(node("strong","ellipsize",item.title));
    const label=item.kind==="open"?"Onglet ouvert":item.kind==="closed"?"Fermé récemment":"Enregistré · "+(item.workspace||"Workspace");
    main.append(node("small","",label+(item.observedAt?" · "+displayTimestamp(item.observedAt):"")));
    row.append(main,action(item.kind==="closed"?"Restaurer":"Reprendre",
      item.kind==="closed"?"restore-session":"open-work",{id:item.id||"",url:item.url},"small-button primary"));
    list.append(row);
  }
  if(!rows.length)list.append(paragraph("Aucun onglet ou favori ChatGPT, Claude, GitHub ou GitLab pour le moment."));
  wrap.append(list);
  wrap.append(buttons(
    action(ctx.closedStatus==="loading"?"Recherche…":"Derniers onglets fermés","read-closed",{},"small-button"),
    action("Ouvrir mon workspace","open-selected-workspace",{},"small-button")
  ));
  if(ctx.closedStatus==="denied")wrap.append(node("p","card-meta","Permission « sessions » refusée ; les favoris restent accessibles."));
  if(ctx.closedStatus==="unavailable")wrap.append(node("p","card-meta","Historique récent non disponible sur cette version d’Edge."));
  return wrap;
}
function pulseView(ctx){
  const wrap=node("div","cockpit-stack");
  wrap.append(paragraph("Dernier workflow CI public seulement, sur demande. Ce n’est pas un statut de release ni une session Codex/Claude en cours.","callout status"));
  const list=node("div","cockpit-list");
  for(const item of galaxyPulseRows(ctx.repos)){
    const row=node("div","cockpit-row");
    const main=node("div","cockpit-main");
    main.append(item.repo||item.url?external(item.repo?"https://github.com/"+item.repo:item.url,item.label,"cockpit-project"):node("strong","cockpit-project",item.label));
    let status="UNKNOWN · non interrogé";
    if(item.observation==="private-unavailable")status="Privé · aucune CI accessible sans compte";
    if(item.observation==="external-unavailable")status="GitLab · non connecté";
    if(item.ci){
      const run=item.ci;
      status="CI "+run.status+(run.sha?" · "+run.sha:"");
      if(run.observedAt)status+=" · lu "+displayTimestamp(run.observedAt);
    }
    main.append(node("small","",status));
    row.append(main);
    if(item.ci?.url)row.append(external(item.ci.url,"Run ↗","small-button"));
    else if(item.repo)row.append(external("https://github.com/"+item.repo+"/actions","CI ↗","small-button"));
    list.append(row);
  }
  wrap.append(list);
  wrap.append(buttons(action(ctx.loading.has("repos")?"Lecture…":"Lire les CI publiques","refresh-repos",{},"small-button primary")));
  if(ctx.errors.get("repos"))wrap.append(node("p","card-meta",ctx.errors.get("repos")));
  return wrap;
}
function attentionView(ctx){
  const wrap=node("div","cockpit-stack");
  const summary=attentionSummary(ctx.repos);
  const container=node("div","metric-row");
  for(const [label,value] of [["CI observées",summary.observedCount+"/"+summary.total],["Problèmes signalés",summary.failures.length],["En cours",summary.pending.length]]){
    const t=node("div","metric-tile");t.append(node("span","",label),node("strong","",value));container.append(t);
  }
  wrap.append(container);
  if(!summary.observedCount)wrap.append(paragraph("Aucune CI encore consultée. Ce n’est pas un état « tout va bien » : les informations manquent.","callout status"));
  else if(summary.failures.length||summary.pending.length){
    for(const row of [...summary.failures,...summary.pending].slice(0,5)){
      const item=node("div","cockpit-row");
      const content=node("div","cockpit-main");
      content.append(node("strong","",row.label),node("small","",row.ci?.status||"UNKNOWN"));
      item.append(content);
      if(row.ci?.url)item.append(external(row.ci.url,"Examiner","small-button"));
      wrap.append(item);
    }
  }else wrap.append(paragraph("Aucun échec signalé parmi les "+summary.observedCount+" dernières CI publiques chargées. Les projets non observés restent inconnus.","callout"));
  wrap.append(buttons(action("Actualiser les CI","refresh-repos",{},"small-button primary")));
  return wrap;
}
function systemView(ctx){
  const wrap=node("div","cockpit-stack");
  const current=ctx.system;
  if(!current.snapshot){
    wrap.append(paragraph(current.error?
      "Bridge non disponible : "+current.error:
      "Non connecté. Le bridge Rust doit être compilé et enregistré sur Windows. Aucun diagnostic n’a encore été demandé.","callout status"));
  }else{
    const s=current.snapshot;
    wrap.append(node("p","card-meta","Mesure locale "+displayTimestamp(s.observedAtMs)+" · "+String(s.platform||"OS inconnu")));
    const metrics=node("div","metric-row");
    const items=[
      ["RAM utilisée",humanBytes(s.memory?.usedBytes)],
      ["RAM disponible",humanBytes(s.memory?.availableBytes)],
      ["CPU échantillonné",Number.isFinite(s.cpuPercent)?s.cpuPercent.toFixed(1)+" %":"inconnu"]
    ];
    for(const [label,value] of items){
      const t=node("div","metric-tile");t.append(node("span","",label),node("strong","",value));metrics.append(t);
    }
    wrap.append(metrics);
    const table=node("ul","link-rows");
    for(const process of Array.isArray(s.processes)?s.processes:[]){
      const row=node("li","link-item");const main=node("div");
      main.append(node("strong","",process.label),node("div","card-meta",process.count>0?
        process.count+" processus détectés · RSS approx. "+humanBytes(process.residentBytes):
        "Non détecté dans cet instantané"));
      row.append(main);table.append(row);
    }
    wrap.append(table);
    if(Array.isArray(s.disks)&&s.disks.length){
      const row=node("div","metric-row");
      for(const [index,disk] of s.disks.slice(0,3).entries()){
        const card=node("div","metric-tile");
        card.append(node("span","","Volume "+(index+1)+" · libre"),node("strong","",humanBytes(disk.availableBytes)));
        row.append(card);
      }
      wrap.append(row);
    }
    wrap.append(node("p","card-meta","La somme RSS d’Edge est indicative ; elle peut compter de la mémoire partagée. Un processus Ollama ne prouve pas qu’un modèle est chargé."));
  }
  wrap.append(buttons(action(current.loading?"Diagnostic…":"Lire mon PC","read-system",{},"small-button primary")));
  wrap.append(node("p","card-meta","Lecture ponctuelle après autorisation explicite ; aucun résultat envoyé sur Internet ni enregistré."));
  return wrap;
}
function discoveryView(){
  const wrap=node("div","cockpit-stack");
  wrap.append(paragraph("Radar de recherche — sources ouvertes, sans collecte automatique ni doublon de backlog.","callout"));
  const values=[
    {name:"GitHub · Rust",url:"https://github.com/trending/rust"},
    {name:"GitHub · TypeScript",url:"https://github.com/trending/typescript"},
    {name:"GitHub · MCP",url:"https://github.com/search?q=topic%3Amcp&type=repositories"},
    {name:"DuckDB · nouveautés",url:"https://duckdb.org/news/"},
    {name:"Fabric · nouveautés",url:"https://blog.fabric.microsoft.com/"}
  ];
  const list=node("ul","link-rows");
  for(const item of values){
    const li=node("li","link-item");li.append(external(item.url,item.name));list.append(li);
  }
  wrap.append(list);
  return wrap;
}
export function renderCockpit(def,ctx){
  if(def.kind==="resume")return resumeView(ctx);
  if(def.kind==="pulse")return pulseView(ctx);
  if(def.kind==="attention")return attentionView(ctx);
  if(def.kind==="system")return systemView(ctx);
  if(def.kind==="discover")return discoveryView();
  return paragraph("Widget non pris en charge.");
}
