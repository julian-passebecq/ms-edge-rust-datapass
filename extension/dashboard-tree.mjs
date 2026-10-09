import {safeHttp,clean} from "./dashboard-data.mjs";
import {node,action} from "./dashboard-dom.mjs";
export function providerFor(raw){
  const safe=safeHttp(raw);
  if(!safe)return null;
  const hostname=new URL(safe).hostname.toLowerCase();
  if(hostname==="chatgpt.com"||hostname==="chat.openai.com")return "ChatGPT";
  if(hostname==="claude.ai")return "Claude";
  return null;
}
export function conversationGroups(workspaces,tabs){
  const grouped={"ChatGPT":{projects:[],live:[]},"Claude":{projects:[],live:[]}};
  const already=new Set();
  for(const project of workspaces.projects||[]){
    for(const provider of Object.keys(grouped)){
      const links=(project.links||[]).filter(item=>providerFor(item.url)===provider);
      if(!links.length)continue;
      grouped[provider].projects.push({name:clean(project.name,60),links:links.slice(0,150)});
      for(const link of links)already.add(link.url);
    }
  }
  for(const tab of tabs){
    const provider=providerFor(tab.url);
    if(!provider||already.has(tab.url))continue;
    grouped[provider].live.push({title:clean(tab.title,100)||provider,url:tab.url});
    already.add(tab.url);
  }
  return grouped;
}
export function renderTree(workspaces,tabs){
  const box=document.getElementById("conversation-tree");
  box.replaceChildren();
  const groups=conversationGroups(workspaces,tabs);
  for(const [name,group] of Object.entries(groups)){
    const section=node("details","provider");
    section.open=true;
    const total=group.projects.reduce((n,p)=>n+p.links.length,0)+group.live.length;
    const summary=node("summary","",name+" ");
    summary.append(node("em","",total+" liens"));
    section.append(summary);
    for(const project of group.projects){
      const fold=node("details","project-group");
      fold.open=true;fold.append(node("summary","",project.name+" · "+project.links.length));
      for(const item of project.links){
        const button=action("↳ "+item.title,"open-conversation",{url:item.url},"convo-link");
        button.title=item.url;fold.append(button);
      }
      section.append(fold);
    }
    if(group.live.length){
      const fold=node("details","project-group");
      fold.open=true;fold.append(node("summary","","Onglets ouverts · "+group.live.length));
      for(const item of group.live){
        const line=node("div","convo-row");
        const open=action("↳ "+item.title,"open-conversation",{url:item.url},"convo-link");
        open.title=item.url;
        const save=action("+","save-conversation",{url:item.url,title:item.title},"save-convo");
        save.title="Enregistrer dans le workspace actif";
        line.append(open,save);fold.append(line);
      }
      section.append(fold);
    }
    if(!total)section.append(node("p","rail-muted","Aucun lien enregistré."));
    box.append(section);
  }
}
