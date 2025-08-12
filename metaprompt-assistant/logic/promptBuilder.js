/**
 * Constrói o UM ÚNICO prompt final, conciso e acionável.
 */
export function buildPrompt({ context, objective, clarifications }) {
  const msgs = (context?.messages || []).slice(-6);
  const summary = summarizeMessages(msgs);
  const extras = (clarifications || []).filter(Boolean).join("; ");

  const lines = [];
  lines.push("Contexto relevante (resumo):");
  lines.push(summary || "-");
  lines.push("");
  lines.push("Objetivo:");
  lines.push(objective || "(não explícito)");
  if (extras) {
    lines.push("");
    lines.push("Notas/Restrições:");
    lines.push(extras);
  }
  lines.push("");
  lines.push("Tarefa:");
  lines.push("Gera uma única resposta que cumpra o objetivo acima com precisão e concisão. Se algo for ambíguo, assume o caso mais útil e explica em 1 frase.");
  lines.push("");
  lines.push("Formato de saída preferido: markdown claro, listas curtas, sem divagações.");

  return lines.join("\n");
}

function summarizeMessages(msgs) {
  // Heurística leve: concatena últimas mensagens com prefixo
  return msgs.map((m) => `${m.role}: ${truncate(m.text, 200)}`).join("\n");
}

function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }
