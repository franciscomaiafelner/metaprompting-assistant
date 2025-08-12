function q(id) { return document.getElementById(id); }

document.addEventListener("DOMContentLoaded", async () => {
  const settings = await send("GET_SETTINGS");
  q("apiKey").value = settings.data.apiKey || "";
  q("maxClarifyQuestions").value = settings.data.maxClarifyQuestions ?? 2;
  q("historyWindow").value = settings.data.historyWindow ?? 6;
  q("confidenceThreshold").value = settings.data.confidenceThreshold ?? 0.65;

  q("save").addEventListener("click", async () => {
    const payload = {
      apiKey: q("apiKey").value.trim(),
      maxClarifyQuestions: clamp(parseInt(q("maxClarifyQuestions").value, 10), 0, 5),
      historyWindow: clamp(parseInt(q("historyWindow").value, 10), 2, 12),
      confidenceThreshold: clamp(parseFloat(q("confidenceThreshold").value), 0, 1)
    };
    await send("SAVE_SETTINGS", payload);
    q("status").textContent = "Guardado ✔︎";
    setTimeout(() => (q("status").textContent = ""), 1500);
  });
});

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function send(type, payload) {
  return new Promise((resolve) => chrome.runtime.sendMessage({ type, payload }, resolve));
}
