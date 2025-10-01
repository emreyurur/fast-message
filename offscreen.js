let ws = null;
let currentUserId = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if(msg.target !== "offscreen") return;

  if(msg.type === "initWS") {
    if(ws) ws.close();
    currentUserId = msg.userId;
    ws = new WebSocket(`wss://batuhantekin.icu/wschat?userId=${currentUserId}`);

    ws.addEventListener("open", () => {
      chrome.runtime.sendMessage({ type: "wsStatus", status: "connected" });
    });
    ws.addEventListener("close", () => {
      chrome.runtime.sendMessage({ type: "wsStatus", status: "disconnected" });
    });
    ws.addEventListener("error", () => {
      chrome.runtime.sendMessage({ type: "wsStatus", status: "error" });
    });
    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if(data.type === "users") {
        chrome.runtime.sendMessage({ type: "users", payload: data.payload });
      }
      if(data.type === "messages") {
        chrome.runtime.sendMessage({ type: "messages", payload: data.payload });
      }
    });
  }

  if(msg.type === "sendMessage") {
    if(ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ to: msg.to, message: msg.message }));
    }
  }
});
