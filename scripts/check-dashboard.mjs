import {readFileSync,readdirSync} from "node:fs";
import {resolve} from "node:path";
const root=resolve("extension");
const files=readdirSync(root).filter(f=>f.endsWith(".mjs"));
const manifest=JSON.parse(readFileSync(resolve(root,"manifest.json"),"utf8"));
const origins=["https://news.google.com/*","https://feeds.bbci.co.uk/*","https://api.github.com/*"];
if(manifest.manifest_version!==3)throw Error("Manifest V3 required");
if(manifest.host_permissions||manifest.content_scripts)throw Error("No unconditional host permissions or content scripts allowed");
for(const value of origins)if(!manifest.optional_host_permissions?.includes(value))throw Error("Missing explicit optional host: "+value);
const html=readFileSync(resolve(root,"dashboard.html"),"utf8");
for(const name of ["dashboard.css","dashboard.mjs","dashboard-tweaks.css","dashboard-cockpit.css"])if(!html.includes(name))throw Error("Missing dashboard asset: "+name);
if(!manifest.optional_permissions?.includes("nativeMessaging")||!manifest.optional_permissions?.includes("sessions"))
  throw Error("Native diagnostics and recent sessions require optional permissions");
if(!html.includes('id="modes"')||!html.includes('id="mode-explainer"'))throw Error("Dashboard mode selector missing");
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
if(new Set(ids).size!==ids.length)throw Error("Duplicate HTML IDs");
for(const name of files){
 const content=readFileSync(resolve(root,name),"utf8");
 for(const match of content.matchAll(/(?:getElementById|\$)\("([^"]+)"\)/g)){
  if((name.startsWith("dashboard-")&&name!=="dashboard-launch.mjs")||name==="dashboard.mjs"){
   if(!ids.includes(match[1]))throw Error("Missing dashboard element "+match[1]+" in "+name);
  }
 }
}
console.log("PASS dashboard: "+files.filter(f=>f.startsWith("dashboard")).length+" modules; "+ids.length+" HTML IDs; opt-in hosts, sessions, native messaging");
