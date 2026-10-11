// Additive, user-initiated launcher for the existing owner-only gallery.
// No host permissions, page scraping, remote code or background polling.
const URL = 'https://datapass-visual-gallery-preview.datapass.workers.dev/';
document.getElementById('open-gallery')?.addEventListener('click', async () => {
  try { await chrome.tabs.create({url:URL,active:true}); }
  catch (error) {
    const toast=document.getElementById('toast');
    if(toast){toast.textContent='Could not open Visual Library: '+String(error);toast.className='toast visible error';}
  }
});
