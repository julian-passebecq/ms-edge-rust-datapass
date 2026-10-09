import {safeHttp,clean} from "./dashboard-data.mjs";
export function node(tag,css="",text){
  const el=document.createElement(tag);
  if(css)el.className=css;
  if(text!==undefined)el.textContent=String(text);
  return el;
}
export function action(text,command,fields={},css="small-button"){
  const el=node("button",css,text);
  el.type="button";el.dataset.action=command;
  for(const [key,value] of Object.entries(fields))el.dataset[key]=String(value);
  return el;
}
export function external(raw,title,css=""){
  const url=safeHttp(raw);
  if(!url)return node("span",css,title);
  const a=node("a",css,title);
  a.href=url;a.target="_blank";a.rel="noopener noreferrer";
  return a;
}
export function paragraph(text,css="callout"){return node("p",css,text);}
export function rowList(items){
  const ul=node("ul","link-rows");
  for(const item of items){
    const li=node("li","link-item");
    li.append(external(item.url,item.title));
    if(item.note)li.append(node("small","",item.note));
    ul.append(li);
  }
  return ul;
}
export function newsList(entries){
  const ul=node("ul","article-list");
  const today=Date.now();
  for(const article of entries){
    const isOld=article.publishedAt&&today-Date.parse(article.publishedAt)>7*86400000;
    const li=node("li","article-item"+(isOld?" stale":""));
    li.append(external(article.url,article.title));
    let label=article.publishedAt?new Date(article.publishedAt).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"}):"Date non fournie";
    if(isOld)label+=" · article ancien";
    li.append(node("small","",label));
    ul.append(li);
  }
  return ul;
}
export function capsule(label,kind=""){
  return node("span","status-chip"+(kind?" "+kind:""),clean(label,70));
}
