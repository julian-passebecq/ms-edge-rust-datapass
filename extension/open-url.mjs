import {safeUrl} from "./core.mjs";
export async function openUrl(raw,active=true){
  const url=safeUrl(raw);
  if(!url)throw Error("Invalid or unsafe URL.");
  const existing=(await chrome.tabs.query({currentWindow:true})).find(tab=>safeUrl(tab.url)===url);
  if(existing){if(active)await chrome.tabs.update(existing.id,{active:true});return false;}
  await chrome.tabs.create({url,active});
  return true;
}
