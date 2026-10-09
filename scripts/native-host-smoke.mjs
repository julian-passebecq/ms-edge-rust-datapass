#!/usr/bin/env node
// Exercises the actual stdio protocol. No native registration and no user profile.
import {spawn} from "node:child_process";
import {resolve} from "node:path";
import {readFileSync} from "node:fs";
import assert from "node:assert/strict";

const file=resolve("bridge","target","release",
  process.platform==="win32"?"datapass-edge-bridge.exe":"datapass-edge-bridge");
readFileSync(file); // Fail immediately when the build artifact is missing.

function frame(payload){
  const bytes=Buffer.from(JSON.stringify(payload),"utf8");
  const header=Buffer.alloc(4);
  header.writeUInt32LE(bytes.length);
  return Buffer.concat([header,bytes]);
}
function parseFrames(data){
  const replies=[];
  let offset=0;
  while(offset<data.length){
    assert.ok(data.length-offset>=4,"truncated native length header");
    const size=data.readUInt32LE(offset);
    assert.ok(size>0&&size<=65536,"invalid native frame length");
    offset+=4;
    assert.ok(data.length-offset>=size,"truncated native response");
    replies.push(JSON.parse(data.subarray(offset,offset+size).toString("utf8")));
    offset+=size;
  }
  return replies;
}
async function runProtocol(){
  const request=Buffer.concat([
    frame({op:"ping"}),
    frame({op:"system_snapshot"}),
    frame({op:"run_command",command:"echo this must never execute"})
  ]);
  const child=spawn(file,[],{stdio:["pipe","pipe","pipe"],windowsHide:true});
  let bytes=Buffer.alloc(0),stderr="";
  child.stdout.on("data",chunk=>{bytes=Buffer.concat([bytes,chunk]);});
  child.stderr.on("data",chunk=>{stderr+=chunk.toString("utf8");});
  const completed=new Promise((resolve,reject)=>{
    child.once("error",reject);
    child.once("close",code=>code===0?resolve():reject(new Error("Host exit "+code+"; "+stderr.slice(0,250))));
  });
  const timer=setTimeout(()=>child.kill(),45000);
  try{
    child.stdin.end(request);
    await completed;
  }finally{clearTimeout(timer);}
  const responses=parseFrames(bytes);
  assert.equal(responses.length,3,"one reply per request");
  assert.equal(responses[0].ok,true);
  assert.equal(responses[0].app,"datapass-edge-bridge");
  assert.ok(responses[0].capabilities.includes("system_snapshot"));
  assert.equal(responses[1].ok,true);
  assert.equal(responses[1].app,"datapass-edge-bridge");
  const snapshot=responses[1].snapshot;
  assert.deepEqual(Object.keys(snapshot).sort(),
    ["cpuPercent","disks","memory","observedAtMs","platform","processes"].sort());
  assert.ok(Number.isFinite(snapshot.memory.totalBytes)&&snapshot.memory.totalBytes>0);
  assert.ok(Number.isFinite(snapshot.memory.availableBytes));
  assert.ok(Array.isArray(snapshot.processes)&&snapshot.processes.length<=4);
  const allowed=new Set(["Edge","Ollama","Docker","Node"]);
  assert.ok(snapshot.processes.every(p=>allowed.has(p.label)));
  assert.ok(snapshot.processes.every(p=>Object.keys(p).sort().join(",")==="count,label,residentBytes"));
  assert.ok(Array.isArray(snapshot.disks)&&snapshot.disks.length<=3);
  assert.ok(snapshot.disks.every(d=>Object.keys(d).sort().join(",")==="availableBytes,totalBytes"));
  assert.equal(responses[2].ok,false);
  assert.equal(responses[2].error,"unsupported_operation");
  console.log("PASS native stdio: ping, sanitized system snapshot, blocked command, framing, clean exit");
}
await runProtocol();
