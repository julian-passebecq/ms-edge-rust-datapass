document.getElementById("open-dashboard")?.addEventListener("click",async()=>{
  const page=chrome.runtime.getURL("dashboard.html");
  const existing=(await chrome.tabs.query({currentWindow:true})).find(t=>t.url===page);
  if(existing)await chrome.tabs.update(existing.id,{active:true});
  else await chrome.tabs.create({url:page,active:true});
});
