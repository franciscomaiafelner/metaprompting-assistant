/**
 * Observa novas mensagens do assistente no chat para “Acompanhar a execução”.
 */
export function observeAssistantReplies(onNewAssistantMessage) {
  const root = document.body;
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (looksLikeAssistantMessage(node)) {
          onNewAssistantMessage(node);
        }
      }
    }
  });
  mo.observe(root, { childList: true, subtree: true });
}

function looksLikeAssistantMessage(node) {
  // Heurística: nós com atributo data-message-author-role="assistant" ou similares
  if (node.hasAttribute?.("data-message-author-role")) {
    return node.getAttribute("data-message-author-role") === "assistant";
  }
  // fallback: procura blocos de markdown gerados
  return !!node.querySelector?.('[data-message-author-role="assistant"], .markdown');
}
