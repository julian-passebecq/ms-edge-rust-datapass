import test from "node:test";
import assert from "node:assert/strict";
import {
 safeUrl,initialState,normalizeState,addProject,renameProject,removeProject,
 addLink,renameLink,removeLink,reorderLink,parseBackup
} from "../extension/core.mjs";
test("only ordinary http(s) links with no credentials are stored",()=>{
  assert.equal(safeUrl("javascript:alert(1)"),null);
  assert.equal(safeUrl("file:///C:/secrets.txt"),null);
  assert.equal(safeUrl("https://user:secret@example.com/"),null);
  assert.equal(safeUrl("https://example.com/x?token=secret&x=ok"),"https://example.com/x?x=ok");
});
test("starter state includes AtlasNote but not its browser data",()=>{
  const state=initialState();
  assert.equal(state.schemaVersion,1);
  assert.equal(state.projects.length,3);
  assert.ok(state.projects.find(p=>p.id==="atlasnote").links.some(l=>l.url.includes("github.com")));
});
test("workspaces can be created, renamed and removed",()=>{
  const base=initialState();
  let state=addProject(base,"Fabric");
  const id=state.activeProjectId;
  state=renameProject(state,id,"Fabric / Contoso");
  assert.equal(state.projects.at(-1).name,"Fabric / Contoso");
  state=removeProject(state,id);
  assert.equal(state.projects.length,3);
  assert.equal(base.projects.length,3);
});
test("links are deduplicated and can be renamed or removed",()=>{
  let s=addProject(initialState(),"Conversation");
  const pid=s.activeProjectId;
  s=addLink(s,pid,{url:"https://chatgpt.com/c/example",title:"Architecture"});
  s=addLink(s,pid,{url:"https://chatgpt.com/c/example",title:"Repeated"});
  assert.equal(s.projects.at(-1).links.length,1);
  const id=s.projects.at(-1).links[0].id;
  s=renameLink(s,pid,id,"Design review");
  assert.equal(s.projects.at(-1).links[0].title,"Design review");
  s=removeLink(s,pid,id);
  assert.equal(s.projects.at(-1).links.length,0);
});
test("drag ordering keeps both records",()=>{
  let s=addProject(initialState(),"Test");
  const pid=s.activeProjectId;
  s=addLink(s,pid,{url:"https://a.example/"});
  s=addLink(s,pid,{url:"https://b.example/"});
  const [a,b]=s.projects.at(-1).links;
  s=reorderLink(s,pid,a.id,b.id);
  assert.deepEqual(s.projects.at(-1).links.map(l=>l.id),[b.id,a.id]);
});
test("backup round trip and schema rejection",()=>{
  const saved=JSON.stringify(addProject(initialState(),"Copy"));
  assert.equal(parseBackup(saved).projects.length,4);
  assert.throws(()=>parseBackup('{"schemaVersion":2,"projects":[]}'),/Unsupported/);
  assert.equal(normalizeState(null).projects.length,3);
});
