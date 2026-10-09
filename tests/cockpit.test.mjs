import test from "node:test";
import assert from "node:assert/strict";
import {CATALOG,GALAXY_TARGETS,defaultDashboard,normalizeDashboard,reviseCard,
  moveCard,reorderCards,resetMode} from "../extension/dashboard-data.mjs";
import {MODE_LABELS,modeDefaultCards,currentCards} from "../extension/dashboard-presets.mjs";
import {resumeCandidates,normalizedClosedSessions,galaxyPulseRows,
  attentionSummary,isWorkUrl} from "../extension/dashboard-recovery.mjs";

test("existing V0.2 dashboard retains its card layout and user preferences",()=>{
  const legacy={
    schemaVersion:1,section:"leisure",
    cards:[
      {id:"quick",visible:true,span:3,order:2},
      {id:"city",visible:false,span:2,order:0},
      {id:"f1",visible:true,span:1,order:1}
    ],
    repos:["julian-passebecq/atlasnote"],tickers:["MSFT"],episodes:[],fixtures:[]
  };
  const upgraded=normalizeDashboard(legacy);
  assert.equal(upgraded.mode,"custom");
  assert.deepEqual(upgraded.cards.slice(0,3).map(c=>c.id),["city","f1","quick"]);
  assert.equal(upgraded.cards.find(c=>c.id==="quick").span,3);
  assert.equal(upgraded.cards.find(c=>c.id==="city").visible,false);
  assert.equal(upgraded.section,"leisure");
  assert.equal(upgraded.tickers[0],"MSFT");
  assert.equal(upgraded.modeLayouts.deep.length,CATALOG.length);
});
test("presets are distinct; edits and hiding survive independent mode switches",()=>{
  let dashboard=defaultDashboard();
  assert.equal(dashboard.mode,"deep");
  assert.ok(currentCards(dashboard).find(c=>c.id==="system").visible);
  assert.equal(currentCards({...dashboard,mode:"evening"}).find(c=>c.id==="mentalist").visible,true);
  dashboard=reviseCard(dashboard,"pulse",{visible:false,span:3});
  assert.equal(currentCards(dashboard).find(c=>c.id==="pulse").visible,false);
  dashboard=normalizeDashboard({...dashboard,mode:"morning"});
  assert.equal(currentCards(dashboard).find(c=>c.id==="pulse").visible,false);
  dashboard=normalizeDashboard({...dashboard,mode:"deep"});
  assert.equal(currentCards(dashboard).find(c=>c.id==="pulse").span,3);
  assert.equal(currentCards(dashboard).find(c=>c.id==="pulse").visible,false);
  assert.ok(Object.keys(MODE_LABELS).includes("custom"));
});
test("mode reset affects only active mode, not user custom layout",()=>{
  const base=defaultDashboard();
  const changed=reviseCard(base,"system",{visible:false});
  const clean=resetMode(changed);
  assert.equal(currentCards(clean).find(c=>c.id==="system").visible,true);
  assert.deepEqual(clean.cards,base.cards);
  assert.equal(clean.modeLayouts.morning.length,CATALOG.length);
});
test("drag reorder changes selected layout without disrupting other modes",()=>{
  const base=defaultDashboard();
  const moved=reorderCards(base,"pulse","resume");
  assert.deepEqual(currentCards(moved).slice(0,3).map(c=>c.id),["pulse","resume","system"]);
  assert.deepEqual(moved.modeLayouts.morning,base.modeLayouts.morning);
  assert.equal(moveCard(moved,"absent",1).mode,"deep");
});
test("work recovery filters allowed hosts, sorts live tabs and avoids URL duplicates",()=>{
  const saved={projects:[{name:"Galaxy",links:[
    {title:"Architecture",url:"https://chatgpt.com/c/id1",createdAt:20},
    {title:"Project notes",url:"https://github.com/julian-passebecq/diagramcloud",createdAt:10}
  ]}]};
  const open=[
    {id:8,title:"Claude current",url:"https://claude.ai/chat/id2",lastAccessed:500},
    {id:2,title:"ChatGPT current",url:"https://chatgpt.com/c/id1",lastAccessed:800},
    {id:9,title:"Gmail",url:"https://mail.google.com/mail/u/0/",lastAccessed:900}
  ];
  const closed=[{sessionId:"123",title:"GitHub closed",url:"https://github.com/julian-passebecq/atlasnote",lastModified:600}];
  const rows=resumeCandidates(saved,open,closed);
  assert.deepEqual(rows.map(x=>x.kind),["open","open","saved","closed"]);
  assert.deepEqual(rows.map(x=>x.title),["ChatGPT current","Claude current","Project notes","GitHub closed"]);
  assert.equal(rows.length,4);
  assert.equal(isWorkUrl("file:///C:/private"),false);
  assert.equal(isWorkUrl("https://mail.google.com/"),false);
});
test("recently closed sessions accept only metadata for recognized work tabs",()=>{
  const source=[
    {tab:{sessionId:"1",url:"https://chatgpt.com/c/one",title:"ChatGPT"},lastModified:19},
    {tab:{sessionId:"2",url:"https://mail.google.com/mail/u/0/",title:"Gmail"}},
    {window:{sessionId:"3",tabs:[{url:"https://claude.ai/"}]}},
    {tab:{url:"https://claude.ai/chat/noid"}}
  ];
  const result=normalizedClosedSessions(source);
  assert.equal(result.length,1);
  assert.equal(result[0].sessionId,"1");
});
test("Galaxy pulse exposes unknown/private without fabricated runtime status",()=>{
  const zero=galaxyPulseRows(new Map());
  assert.equal(zero.find(p=>p.id==="pm").observation,"private-unavailable");
  assert.equal(zero.find(p=>p.id==="brain").observation,"private-unavailable");
  assert.equal(zero.find(p=>p.id==="factory").observation,"external-unavailable");
  assert.equal(attentionSummary(new Map()).observedCount,0);
  assert.ok(GALAXY_TARGETS.every(t=>t.access!=="private"||!t.repo));
});
test("attention counts only explicitly fetched public latest CI states",()=>{
  const records=new Map([
    ["julian-passebecq/datapass-agent",{status:"failure",sha:"a123",url:"https://github.com/julian-passebecq/datapass-agent/actions/runs/1"}],
    ["julian-passebecq/diagramcloud",{status:"in_progress",sha:"b456"}],
    ["julian-passebecq/atlasnote",{status:"success",sha:"c789"}]
  ]);
  const result=attentionSummary(records);
  assert.equal(result.observedCount,3);
  assert.equal(result.failures.length,1);
  assert.equal(result.pending.length,1);
  assert.equal(result.total,GALAXY_TARGETS.length);
});
