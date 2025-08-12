/**
 * Lê histórico e textarea do ChatGPT com heurísticas tolerantes a mudanças de DOM.
 */
export function readContext({ historyWindow = 6 } = {}) {
  const messages = getMessages();
  const lastMsgs = messages.slice(-historyWindow);
  const userDraft = getTextareaValue();
  return {
    messages: lastMsgs,
    userDraft
  };
}

// Heurística de mensagens (autor + texto)
export function getMessages() {
  const nodes = document.querySelectorAll("[data-message-author-role], .markdown");
  const out = [];
  nodes.forEach((n) => {
    const role =
      n.getAttribute?.("data-message-author-role") ||
      guessRoleFromNode(n);
    const text = (n.innerText || "").trim();
    if (text) out.push({ role, text });
  });
  return out;
}

function guessRoleFromNode(n) {
  const t = (n.innerText || "").toLowerCase();
  // heurística simples
  if (t.startsWith("you:") || t.includes("user")) return "user";
  return "assistant";
}

export function getTextareaEl() {
  // O ChatGPT costuma ter um único textarea de input
  const t1 = document.querySelector("textarea");
  if (t1) return t1;
  // fallback por role
  return document.querySelector('textarea[aria-label*="message" i]');
}

export function getTextareaValue() {
  const el = getTextareaEl();
  return el ? el.value : "";
}
