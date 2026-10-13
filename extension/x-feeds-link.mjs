// Opens the local X feed organizer, never X content inside the extension.
const button=document.getElementById('open-x-feeds');
if(button)button.addEventListener('click',()=>{
  void chrome.tabs.create({url:chrome.runtime.getURL('x-feeds.html'),active:true});
});
