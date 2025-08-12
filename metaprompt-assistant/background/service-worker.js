/**
 * Background (MV3 service worker)
 * - Guarda/fornece settings via chrome.storage
 * - (Futuro) Proxy para chamadas de rede (ex.: OpenAI) se necessário (CSP/CORS)
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log("[MPA] Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message || {};
  if (type === "GET_SETTINGS") {
    chrome.storage.sync.get(
      {
        apiKey: "",
        maxClarifyQuestions: 2,
        historyWindow: 6,
        confidenceThreshold: 0.65
      },
      (data) => sendResponse({ ok: true, data })
    );
    return true;
  }
  if (type === "SAVE_SETTINGS") {
    chrome.storage.sync.set(payload || {}, () => sendResponse({ ok: true }));
    return true;
  }
  // (Opcional futuro) OPENAI_COMPLETE proxy
  return false;
});
