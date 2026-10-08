// The Edge toolbar action opens the side panel. No background polling.
async function enableSidePanel() {
  try { await chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true}); }
  catch (err) { console.warn("DataPass side panel unavailable",err); }
}
chrome.runtime.onInstalled.addListener(enableSidePanel);
chrome.runtime.onStartup.addListener(enableSidePanel);
