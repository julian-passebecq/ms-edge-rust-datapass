import {chromium} from "playwright";
import assert from "node:assert/strict";
import {mkdtemp,mkdir,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {resolve,join} from "node:path";
const extension=resolve("extension");
const profile=await mkdtemp(join(tmpdir(),"datapass-xfeeds-"));
const screenshots=resolve("artifacts","x-feeds");
await mkdir(screenshots,{recursive:true});
let context;
try{
  context=await chromium.launchPersistentContext(profile,{
    headless:true,channel:"chromium",viewport:{width:1440,height:1000},
    args:["--disable-extensions-except="+extension,"--load-extension="+extension,"--no-first-run"]
  });
  const worker=context.serviceWorkers().find(w=>w.url().startsWith("chrome-extension://"))||
    await context.waitForEvent("serviceworker",{timeout:30000});
  const id=new URL(worker.url()).hostname;
  assert.match(id,/^[a-p]{32}$/);
  const page=await context.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  await page.goto("chrome-extension://"+id+"/x-feeds.html",{waitUntil:"domcontentloaded"});
  await page.locator(".feed-tab").first().waitFor({timeout:30000});
  assert.equal(await page.locator(".feed-tab").count(),6);
  assert.match(await page.locator("#feed-details").innerText(),/x.com\/home/);
  await page.screenshot({path:join(screenshots,"01-desktop.png"),fullPage:true});
  await page.locator("#feed-title").fill("Agent architectures");
  await page.locator("#feed-url").fill("https://x.com/search?q=multi-agent+architecture&f=live");
  await page.locator("#add-feed button[type=submit]").click();
  await page.getByRole("tab",{name:"Agent architectures"}).waitFor({timeout:15000});
  assert.equal(await page.locator(".feed-tab").count(),7);
  await page.reload({waitUntil:"domcontentloaded"});
  await page.getByRole("tab",{name:"Agent architectures"}).waitFor({timeout:15000});
  assert.equal(await page.getByRole("tab",{name:"Agent architectures"}).getAttribute("aria-selected"),"true");
  await page.screenshot({path:join(screenshots,"02-custom-persisted.png"),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  const dims=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth
  }));
  assert.ok(dims.scroll<=dims.client+2,"390px horizontal overflow: "+JSON.stringify(dims));
  await page.screenshot({path:join(screenshots,"03-mobile.png"),fullPage:true});
  assert.deepEqual(errors,[]);
  console.log("PASS Edge X Feeds: extension loaded, presets, add, persistence and 390px responsive");
}finally{
  if(context)await context.close();
  await rm(profile,{recursive:true,force:true});
}
