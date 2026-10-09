import {SHORTCUTS,SERVICE_LINKS,safeTicker} from "./dashboard-data.mjs";
import {latestAvailable} from "./dashboard-feed.mjs";
import {node,action,external,paragraph,rowList,newsList,capsule} from "./dashboard-dom.mjs";

function actions(...children){const area=node("div","card-actions");area.append(...children);return area;}
function feedView(def,ctx){
  const body=node("div");
  const articles=ctx.feeds.get(def.id),error=ctx.errors.get(def.id);
  if(articles?.length)body.append(newsList(articles));
  else body.append(paragraph(error?"Source indisponible : "+error:"Les titres s’affichent après autorisation du flux. Aucun rafraîchissement en arrière-plan.","callout status"));
  body.append(actions(action(ctx.loading.has(def.id)?"Chargement…":"Actualiser le flux","refresh-feed",{id:def.id},"small-button primary")));
  return body;
}
function cityView(def,ctx){
  const body=node("div");
  const upcoming=latestAvailable(ctx.state.fixtures);
  if(upcoming.length){
    const ul=node("ul","fixture-list");
    for(const item of upcoming){
      const li=node("li","fixture-item");
      li.append(node("div","favourite-episode",item.title));
      const time=item.allDay?new Date(item.start).toLocaleDateString("fr-FR",{dateStyle:"full",timeZone:"Europe/Oslo"})+" · journée sans horaire":new Date(item.start).toLocaleString("fr-FR",{dateStyle:"full",timeStyle:"short",timeZone:"Europe/Oslo"})+" · heure Oslo";
      li.append(node("small","",time));
      ul.append(li);
    }
    body.append(ul);
  }else{
    body.append(paragraph("Prochain match : à synchroniser. Importe le calendrier officiel .ics de Manchester City pour afficher les rencontres à venir, sans inventer d’horaire."));
  }
  body.append(feedView(def,ctx));
  body.append(actions(action("Importer calendrier .ics","import-ics"),external("https://www.mancity.com/fixtures/","Calendrier officiel","small-button"),external("https://www.premierleague.com/en/news/1235133/download-the-202627-fixtures-to-your-calendar","Abonnement calendrier","small-button")));
  return body;
}
function netflixView(def,ctx){
  const body=node("div");
  const box=node("div","callout");
  box.append(node("strong","","3 Body Problem · saison 2"));
  box.append(node("p","","Production annoncée par Netflix en novembre 2025. Date de sortie non confirmée ici."));
  box.append(external("https://www.netflix.com/tudum/articles/3-body-problem-renewed","Annonce officielle Tudum"));
  body.append(box,feedView(def,ctx));
  body.append(actions(external("https://www.netflix.com/tudum/topics/news/all","Nouveautés Netflix","small-button")));
  return body;
}
function mentalistView(ctx){
  const body=node("div");
  body.append(paragraph("Une liste personnelle d’épisodes à revoir pour les scènes amusantes. Ce n’est pas un classement officiel.","callout"));
  const ul=node("ul","episode-list");
  for(const [index,ep] of ctx.state.episodes.entries()){
    const li=node("li","episode-item");
    li.append(node("div","favourite-episode",ep.title));
    if(ep.note)li.append(node("p","episode-note",ep.note));
    const row=actions();
    if(ep.url)row.append(external(ep.url,"Fiche épisode","small-button"));
    row.append(action("Retirer","remove-episode",{index},"small-button"));
    li.append(row);ul.append(li);
  }
  if(!ctx.state.episodes.length)ul.append(node("li","episode-item","Aucun épisode enregistré."));
  body.append(ul);
  body.append(actions(action("+ Ajouter un épisode","add-episode"),
    external("https://www.google.com/search?q=The+Mentalist+funniest+episodes","Rechercher les plus drôles","small-button")));
  return body;
}
function financeView(ctx){
  const body=node("div");
  body.append(paragraph("Watchlist de symboles uniquement. Pas de cours affichés sans fournisseur de cotations validé.","callout"));
  const list=node("div","inline-badges");
  for(const ticker of ctx.state.tickers){
    if(!safeTicker(ticker))continue;
    list.append(external("https://finance.yahoo.com/quote/"+encodeURIComponent(ticker)+"/",ticker));
    list.append(action("×","remove-ticker",{ticker},"small-button"));
  }
  body.append(list,actions(action("+ Symbole","add-ticker"),external("https://finance.yahoo.com/","Yahoo Finance","small-button")));
  return body;
}
function gmailView(){
  const body=node("div");
  body.append(paragraph("Non connecté · pas de lecture des e-mails ou de compteur non lus. Gmail reste dans ta session Edge.","callout status"));
  body.append(actions(external("https://mail.google.com/mail/u/0/","Boîte de réception","small-button primary"),
    external("https://mail.google.com/mail/u/0/#compose","Nouveau message","small-button")));
  return body;
}
function repoView(ctx){
  const body=node("div");
  const ul=node("ul","link-rows");
  for(const repo of ctx.state.repos){
    const status=ctx.repos.get(repo);
    const li=node("li","link-item");
    const cell=node("div");
    cell.append(external("https://github.com/"+repo,repo.split("/")[1],"repo-name"));
    const sub=node("div","card-meta",status?
      "CI: "+status.status+(status.sha?" · "+status.sha:""):"CI: non interrogée");
    cell.append(sub);li.append(cell);
    const right=node("div","card-actions");
    if(status?.url)right.append(external(status.url,"Run","small-button"));
    right.append(external("https://github.com/"+repo+"/actions","CI","small-button"),
      action("×","remove-repo",{repo},"small-button"));
    li.append(right);ul.append(li);
  }
  body.append(ul);
  const errors=ctx.errors.get("repos");
  if(errors)body.append(paragraph("GitHub : "+errors));
  body.append(actions(action("Vérifier CI publics","refresh-repos"),action("+ Repo","add-repo")));
  return body;
}
function quotaView(){
  const body=node("div");
  body.append(paragraph("Consommations personnelles : NON CONNECTÉES. Aucun pourcentage de quota n’est estimé. Les consoles officielles restent propriétaires des chiffres.","callout status"));
  body.append(rowList([
    {title:"GitHub Actions · minutes et stockage",url:"https://github.com/settings/billing",note:"Compte / Organisation"},
    {title:"Cloudflare · Workers, R2, usage",url:"https://dash.cloudflare.com/",note:"Choisir le compte → Billing"},
    {title:"Netlify · usage et build",url:"https://app.netlify.com/",note:"Site / Team usage"},
    {title:"MongoDB Atlas · métriques",url:"https://cloud.mongodb.com/",note:"Cluster / monitoring"}
  ]));
  return body;
}
function quickView(){
  const body=node("div","quick-grid");
  const icons=["✳","◈","◉","▣","◇","☁"];
  SHORTCUTS.forEach((shortcut,i)=>{
    const link=external(shortcut.url,"","quick-link");
    const symbol=node("span","quick-bullet",icons[i]||"↗");
    link.append(symbol,node("span","",shortcut.title));
    body.append(link);
  });
  return body;
}
export function renderCardBody(def,ctx){
  switch(def.kind){
    case "quick":return quickView();
    case "feed":return feedView(def,ctx);
    case "city":return cityView(def,ctx);
    case "netflix":return netflixView(def,ctx);
    case "mentalist":return mentalistView(ctx);
    case "finance":return financeView(ctx);
    case "gmail":return gmailView();
    case "repos":return repoView(ctx);
    case "quota":return quotaView();
    case "services":return rowList(SERVICE_LINKS);
    default:return paragraph("Module indisponible.");
  }
}
