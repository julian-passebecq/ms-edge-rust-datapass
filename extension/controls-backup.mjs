import {normalizeState,parseBackup} from "./core.mjs";
const $=id=>document.getElementById(id);
export function bindBackup(api){
  $("export").addEventListener("click",()=>api.run(async()=>{
    const data=JSON.stringify(normalizeState(api.getState()),null,2);
    const uri=URL.createObjectURL(new Blob([data],{type:"application/json"}));
    const link=document.createElement("a");
    link.href=uri;link.download="datapass-edge-"+new Date().toISOString().slice(0,10)+".json";
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(uri),1500);
    api.show("Workspace backup exported (URLs and titles).");
  }));
  $("import").addEventListener("click",()=>$("backup-file").click());
  $("backup-file").addEventListener("change",event=>api.run(async()=>{
    const input=event.target,file=input.files?.[0];
    if(!file)return;
    try {
      if(file.size>2_000_000)throw Error("Backup exceeds 2 MB.");
      const imported=parseBackup(await file.text());
      if(!window.confirm("Replace local workspaces with "+imported.projects.length+" imported workspaces? Export your current backup first."))return;
      await api.transact(()=>imported);
      api.show("Backup imported.");
    }finally{input.value="";}
  }));
  $("bridge").addEventListener("click",()=>api.run(async()=>{
    const granted=await chrome.permissions.request({permissions:["nativeMessaging"]});
    if(!granted){api.show("Native Messaging permission declined.");return;}
    const res=await chrome.runtime.sendNativeMessage("com.datapass.edgebridge",{op:"ping"});
    if(res?.ok&&res.app==="datapass-edge-bridge")api.show("Rust bridge connected: "+res.version);
    else throw Error("Unexpected Rust bridge response.");
  }));
}
