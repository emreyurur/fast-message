// background.js
async function ensureOffscreen() {
  const hasDoc = await chrome.offscreen.hasDocument();
  if (hasDoc) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['WEB_SOCKET'],
    justification: 'Keep WebSocket alive for chat'
  });
}

// popup veya diğer yerlerden gelen mesajları offscreen'a ilet
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if(['initWS','sendMessage'].includes(msg.type)) {
    ensureOffscreen().then(() => {
      chrome.runtime.sendMessage({ target: 'offscreen', ...msg });
    });
  }
});
