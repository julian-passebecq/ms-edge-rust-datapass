import {CATALOG,SECTION_LABELS} from "./dashboard-data.mjs";
import {MODE_LABELS,MODE_DESCRIPTIONS,currentCards} from "./dashboard-presets.mjs";
import {node,action,external} from "./dashboard-dom.mjs";
import {renderCardBody} from "./dashboard-views.mjs";
const $=id=>document.getElementById(id);
export function renderDashboard(ctx){
  const modes=$("modes");modes.replaceChildren();
  for(const [id,label] of Object.entries(MODE_LABELS)){
    const b=action(label,"set-mode",{mode:id},"mode-tab"+(ctx.state.mode===id?" active":""));
    b.setAttribute("aria-pressed",String(ctx.state.mode===id));
    b.title=MODE_DESCRIPTIONS[id]||"";
    modes.append(b);
  }
  $("mode-explainer").textContent=MODE_DESCRIPTIONS[ctx.state.mode]||"Disposition personnelle";
  const filters=$("filters");filters.replaceChildren();
  for(const [id,label] of Object.entries(SECTION_LABELS)){
    const btn=action(label,"set-section",{section:id},"filter-tab"+(ctx.state.section===id?" active":""));
    btn.setAttribute("aria-pressed",String(ctx.state.section===id));
    filters.append(btn);
  }
  for(const element of document.querySelectorAll("[data-view]")){
    element.classList.toggle("active",element.dataset.view===ctx.state.section);
  }
  const selected=currentCards(ctx.state).filter(c=>c.visible&&
    (ctx.state.section==="all"||CATALOG.find(d=>d.id===c.id)?.section===ctx.state.section));
  $("widget-counter").textContent=selected.length+" encadrés actifs";
  const grid=$("cards");grid.replaceChildren();
  for(const card of selected){
    const def=CATALOG.find(d=>d.id===card.id);if(!def)continue;
    const element=node("article","card span-"+card.span);
    element.dataset.id=card.id;element.dataset.section=def.section;
    element.draggable=true;
    const header=node("header","card-head");
    const icon=node("span","card-icon",def.icon);icon.setAttribute("aria-hidden","true");
    const titles=node("div","card-heading");
    titles.append(node("h2","card-title",def.title),node("p","card-kicker",SECTION_LABELS[def.section]));
    const tools=node("div","card-tools");
    for(const [label,name,desc] of [
      ["↑","move-up","Déplacer la carte vers le haut"],
      ["↓","move-down","Déplacer la carte vers le bas"],
      ["◫","resize-card","Changer largeur"],
      ["×","hide-card","Masquer ce widget"]]){
      const b=action(label,name,{id:card.id},"card-tool");
      b.title=desc;b.setAttribute("aria-label",desc);tools.append(b);
    }
    header.append(icon,titles,tools);
    element.append(header);
    const body=node("div","card-body");
    body.append(renderCardBody(def,ctx));
    element.append(body);
    const footer=node("footer","card-footer");
    const source=def.kind==="system"?"Rust · opt-in / local":def.kind==="pulse"?"CI publique · clic manuel":
      def.kind==="resume"?"Métadonnées de navigation · local":def.feed?
      (def.feed.type==="rss"?"Flux RSS BBC":"Google News · sur demande"):"Local / raccourcis";
    footer.append(node("span","",source));
    if(def.url)footer.append(external(def.url,"Ouvrir la source ↗"));
    element.append(footer);
    grid.append(element);
  }
  $("empty-view").hidden=selected.length>0;
  renderCatalog(ctx);
  const loaded=ctx.feeds.size;
  $("data-health").textContent=loaded?
    loaded+" flux chargés dans la session · données non archivées":
    "Sources externes chargées uniquement sur demande";
}
function renderCatalog(ctx){
  const target=$("widget-catalog");target.replaceChildren();
  for(const def of CATALOG){
    const card=currentCards(ctx.state).find(c=>c.id===def.id),row=node("div","catalog-row");
    const check=node("input");check.type="checkbox";check.checked=card?.visible??false;
    check.dataset.action="toggle-card";check.dataset.id=def.id;check.id="catalog-"+def.id;
    const label=node("label","",def.title);label.htmlFor=check.id;
    const group=node("small","",SECTION_LABELS[def.section]);
    row.append(check,label,group);
    target.append(row);
  }
}
