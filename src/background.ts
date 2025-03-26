// Escuchar cuando se instala la extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log('Facebook Lead Manager Pro installed');
});

// Manejar mensajes del content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'CONTENT_SCRIPT_LOADED') {
    console.log('Content script loaded in tab:', sender.tab?.id);
    sendResponse({ status: 'ok' });
  }
  return true;
});