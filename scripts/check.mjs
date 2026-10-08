import {readdirSync,readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {join} from "node:path";
const files=readdirSync("extension").filter(name=>name.endsWith(".mjs"));
for(const name of files)execFileSync(process.execPath,["--check",join("extension",name)],{stdio:"inherit"});
const manifest=JSON.parse(readFileSync("extension/manifest.json","utf8"));
if(manifest.manifest_version!==3||!manifest.permissions.includes("sidePanel"))throw Error("Invalid MV3 side panel manifest");
if(manifest.host_permissions||manifest.content_scripts)throw Error("Unexpected site-wide access");
console.log("PASS: "+files.length+" modules and secure MV3 manifest");
