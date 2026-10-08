import {addProject,renameProject,removeProject,selectProject,toggleProject} from "./core.mjs";
const $=id=>document.getElementById(id);
export function bindProjects(api){
  $("new-project").addEventListener("click",()=>{$("project-form").hidden=false;$("project-name").focus();});
  $("cancel-project").addEventListener("click",()=>{$("project-form").hidden=true;});
  $("project-form").addEventListener("submit",event=>{
    event.preventDefault();
    api.run(async()=>{
      await api.transact(s=>addProject(s,$("project-name").value));
      $("project-name").value="";$("project-form").hidden=true;api.show("Workspace created.");
    });
  });
  $("projects").addEventListener("click",event=>{
    const b=event.target.closest("button[data-action]");
    if(!b||!b.dataset.action.endsWith("project"))return;
    api.run(async()=>{
      const id=b.dataset.project,p=api.getState().projects.find(x=>x.id===id);
      switch(b.dataset.action){
        case "select-project":await api.transact(s=>selectProject(s,id));break;
        case "toggle-project":await api.transact(s=>toggleProject(s,id));break;
        case "rename-project":{
          const name=window.prompt("Workspace name",p?.name||"");
          if(name?.trim())await api.transact(s=>renameProject(s,id,name));
          break;
        }
        case "remove-project":
          if(p&&window.confirm('Delete workspace "'+p.name+'"? Tabs are unaffected.'))
            await api.transact(s=>removeProject(s,id));
      }
    });
  });
}
