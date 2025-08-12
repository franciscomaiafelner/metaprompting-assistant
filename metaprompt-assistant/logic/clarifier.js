/**
 * Gera perguntas de clarificação curtas até ganhar confiança.
 */
export function nextQuestions({ context, objective, clarifications, max = 2, confidenceThreshold = 0.65 }) {
  const conf = estimateConfidence({ context, objective, clarifications });
  if (conf >= confidenceThreshold) return [];

  const qs = [];
  if (!objective || objective.length < 8) {
    qs.push("Qual é o objetivo imediato da tua próxima mensagem?");
  }
  if (!mentionsDeliverable(objective) && qs.length < max) {
    qs.push("Queres um texto, código, lista de passos, ou outra coisa?");
  }
  if (!hasConstraints(context) && qs.length < max) {
    qs.push("Há restrições de tamanho, tom, idioma, ferramentas ou tempo?");
  }
  return qs.slice(0, max);
}

function estimateConfidence({ context, objective, clarifications }) {
  let score = 0;
  if (objective && objective.length > 8) score += 0.4;
  if ((clarifications || []).some(Boolean)) score += 0.2;
  const last = (context?.messages || []).slice(-1)[0]?.text || "";
  if (last.length > 20) score += 0.2;
  if ((context?.userDraft || "").length > 10) score += 0.2;
  return Math.min(1, score);
}

function mentionsDeliverable(s = "") {
  return /\b(código|code|lista|passos|plano|resumo|prompt|exemplo)\b/i.test(s);
}

function hasConstraints(ctx) {
  const draft = ctx?.userDraft || "";
  return /\b(portugu[eê]s|ingl[eê]s|curto|longo|tom|formato|json|markdown)\b/i.test(draft);
}
