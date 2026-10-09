import test from "node:test";
import assert from "node:assert/strict";
import {
 CATALOG,defaultDashboard,normalizeDashboard,reviseCard,moveCard,safeHttp,
 safeRepo,safeTicker,feedUrl
} from "../extension/dashboard-data.mjs";
import {isoFromIcs,parseIcs,latestAvailable} from "../extension/dashboard-feed.mjs";
import {providerFor,conversationGroups} from "../extension/dashboard-tree.mjs";
test("catalog contains all requested subjects with unique stable IDs",()=>{
 const required=["quick","tech-no","bbc-world","bfm","bfm-business","cnn","city","f1","netflix",
 "mentalist","gaming","finance","gmail","repos","quota","services"];
 assert.deepEqual(CATALOG.map(c=>c.id),required);
 assert.equal(new Set(CATALOG.map(c=>c.id)).size,CATALOG.length);
});
test("layout hides/restores cards and persists widths safely",()=>{
 const start=defaultDashboard();
 const hidden=reviseCard(start,"cnn",{visible:false,span:3});
 assert.equal(hidden.cards.find(c=>c.id==="cnn").visible,false);
 assert.equal(hidden.cards.find(c=>c.id==="cnn").span,3);
 assert.equal(normalizeDashboard({...hidden,cards:[{id:"malicious",visible:true,span:200},...hidden.cards]}).cards.length,CATALOG.length);
 assert.equal(normalizeDashboard({schemaVersion:2}).schemaVersion,1);
 assert.equal(start.cards.find(c=>c.id==="cnn").visible,true);
});
test("keyboard widget reordering leaves stable distinct IDs",()=>{
 const s=moveCard(defaultDashboard(),"bfm",1);
 assert.equal(new Set(s.cards.map(c=>c.id)).size,CATALOG.length);
 assert.equal(s.cards.find(c=>c.id==="bfm").order,4);
});
test("external links and ticker/repo identifiers are validated",()=>{
 assert.equal(safeHttp("javascript:alert(1)"),null);
 assert.equal(safeHttp("file:///C:/Users/example/a.txt"),null);
 assert.equal(safeHttp("https://a:b@example.org/"),null);
 assert.equal(safeRepo("julian-passebecq/atlasnote"),"julian-passebecq/atlasnote");
 assert.equal(safeRepo("owner/repo?q=bad"),null);
 assert.equal(safeTicker("nvda"),"NVDA");
 assert.equal(safeTicker("AAPL&evil"),null);
});
test("news feeds point only at intended public origins",()=>{
 const bbc=CATALOG.find(c=>c.id==="bbc-world");
 assert.equal(new URL(feedUrl(bbc.feed)).origin,"https://feeds.bbci.co.uk");
 for(const id of ["tech-no","bfm","cnn","gaming","netflix","city"]){
   const def=CATALOG.find(c=>c.id===id);
   assert.equal(new URL(feedUrl(def.feed)).origin,"https://news.google.com");
 }
});
test("calendar import supports UTC with correct absolute times, not guessed TZID",()=>{
 assert.equal(isoFromIcs("20261011T153000Z"),"2026-10-11T15:30:00.000Z");
 assert.equal(isoFromIcs("20261011T153000"),null);
 const calendar="BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:Liverpool - Manchester City\nDTSTART:20261011T153000Z\nEND:VEVENT\nBEGIN:VEVENT\nSUMMARY:Unsupported local\nDTSTART;TZID=Europe/London:20261018T143000\nEND:VEVENT\nEND:VCALENDAR";
 const events=parseIcs(calendar);
 assert.equal(events.length,1);
 assert.equal(events[0].title,"Liverpool - Manchester City");
 assert.equal(latestAvailable(events,Date.parse("2026-10-10T00:00:00Z")).length,1);
 assert.equal(latestAvailable(events,Date.parse("2026-10-12T00:00:00Z")).length,0);
});
test("conversation tree selects only ChatGPT and Claude saved links or open tabs",()=>{
 assert.equal(providerFor("https://chatgpt.com/c/123"),"ChatGPT");
 assert.equal(providerFor("https://claude.ai/chat/456"),"Claude");
 assert.equal(providerFor("https://mail.google.com/mail/"),null);
 const workspaces={projects:[{name:"Galaxy",links:[{url:"https://chatgpt.com/c/123",title:"Plan"}]}]};
 const grouped=conversationGroups(workspaces,[{url:"https://claude.ai/chat/456",title:"Claude"}]);
 assert.equal(grouped.ChatGPT.projects[0].links.length,1);
 assert.equal(grouped.Claude.live.length,1);
});
