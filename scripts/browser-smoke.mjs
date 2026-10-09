#!/usr/bin/env node
// Synthetic, isolated browser qualification. Never connects to real ChatGPT/Claude accounts.
import assert from "node:assert/strict";
import {mkdtemp,mkdir,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {chromium} from "playwright";

const extension=resolve("extension");
const evidence=resolve("artifacts","edge-dashboard-synthetic");
await mkdir(evidence,{recursive:true});
const profile=await mkdtemp(join(tmpdir(),"datapass-edge-synthetic-"));
let context;
try{
  context=await chromium.launchPersistentContext(profile,{
    headless:true,channel:"chromium",
    viewport:{width:1440,height:1000},
    args:["--no-first-run","--disable-extensions-except="+extension,"--load-extension="+extension]
  });
  const worker=context.serviceWorkers().find(w=>w.url().startsWith("chrome-extension://"))||
    await context.waitForEvent("serviceworker",{timeout:25000});
  const id=new URL(worker.url()).hostname;
  assert.match(id,/^[a-p]{32}$/,"synthetic extension must load");
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("chrome-extension://"+id+"/dashboard.html",{waitUntil:"domcontentloaded"});
  await page.locator("#modes .mode-tab").first().waitFor({timeout:25000});
  assert.equal(await page.locator("#modes .mode-tab").count(),4);
  assert.equal(await page.locator('#modes [data-mode="deep"]').getAttribute("aria-pressed"),"true");
  assert.ok(await page.locator('#cards .card[data-id="resume"]').count()===1);
  assert.ok(await page.locator('#cards .card[data-id="system"]').count()===1);
  await page.screenshot({path:join(evidence,"01-deep-work.png"),fullPage:true});

  await page.locator('#modes [data-mode="morning"]').click();
  assert.equal(await page.locator('#modes [data-mode="morning"]').getAttribute("aria-pressed"),"true");
  assert.equal(await page.locator('#cards .card[data-id="norsk"]').count(),1);
  await page.screenshot({path:join(evidence,"02-morning.png"),fullPage:true});

  await page.locator('#modes [data-mode="evening"]').click();
  const mentalist=page.locator('#cards .card[data-id="mentalist"]');
  assert.equal(await mentalist.count(),1);
  await mentalist.locator('[data-action="hide-card"]').click();
  // chrome.storage.local writes and DOM rendering are asynchronous.
  await page.locator('#cards .card[data-id="mentalist"]').waitFor({state:"detached",timeout:10000});
  await page.locator('#modes [data-mode="deep"]').click();
  await page.locator('#cards .card[data-id="resume"]').waitFor({state:"visible",timeout:10000});
  await page.locator('#modes [data-mode="evening"]').click();
  await page.waitForFunction(()=>document.querySelector('#modes [data-mode="evening"]')?.getAttribute("aria-pressed")==="true");
  assert.equal(await page.locator('#cards .card[data-id="mentalist"]').count(),0);
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#modes .mode-tab").first().waitFor();
  assert.equal(await page.locator('#cards .card[data-id="mentalist"]').count(),0);
  await page.screenshot({path:join(evidence,"03-evening-personalized.png"),fullPage:true});

  await page.locator("#manage").click();
  assert.equal(await page.locator("#manage-dialog").evaluate(d=>d.open),true);
  const toggle=page.locator('#widget-catalog input[data-id="mentalist"]');
  assert.equal(await toggle.isChecked(),false);
  await toggle.check();
  await page.locator('#cards .card[data-id="mentalist"]').waitFor({state:"visible",timeout:10000});
  await page.locator("#save-layout").click();

  await page.evaluate(async()=>{
    const state={
      schemaVersion:1,activeProjectId:"galaxy",
      projects:[{id:"galaxy",name:"Galaxy",collapsed:false,links:[
        {id:"synthetic",title:"Synthetic GitHub test",url:"https://github.com/julian-passebecq/diagramcloud",createdAt:0}
      ]}]
    };
    await chrome.storage.local.set({"datapass.edge.workspaces.v1":state});
  });
  await page.locator('#modes [data-mode="deep"]').click();
  await page.locator('#cards .card[data-id="resume"] .cockpit-row').first().waitFor();
  await page.screenshot({path:join(evidence,"04-resume-synthetic.png"),fullPage:true});

  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:join(evidence,"05-responsive-mobile.png"),fullPage:true});
  const geometry=await page.evaluate(()=>({
    scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth
  }));
  assert.ok(geometry.scrollWidth<=geometry.clientWidth+2,
    "mobile layout should not overflow horizontally: "+JSON.stringify(geometry));
  assert.deepEqual(errors,[],"dashboard should load without JavaScript page errors");
  console.log("PASS synthetic Chromium extension: layouts, persistence, manager, saved-link resume, desktop/mobile screenshots");
}catch(error){
  console.error("Browser qualification failed:",error);
  throw error;
}finally{
  if(context)await context.close();
  await rm(profile,{recursive:true,force:true});
}
