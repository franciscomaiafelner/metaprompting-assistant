/**
 * Compara a resposta da IA com o objetivo e sugere o próximo ajuste.
 */
export function checkAlignment({ objective, lastPrompt, assistantReply }) {
  if (!assistantReply || !objective) return "";
  const miss = detectMiss(assistantReply, objective);
  if (!miss) return "";
  return `Sugestão: ${miss} — Reformula o próximo prompt pedindo explicitamente isso.`;
}

function detectMiss(reply, objective) {
  const wantCode = /\b(c[oó]digo|code|exemplo)\b/i.test(objective);
  if (wantCode && !/```/.test(reply)) return "pede código com bloco ```";
  if (/lista|passos/i.test(objective) && !/^\s*[-*]|\d+\./m.test(reply)) return "pede lista de passos";
  if (/portugu[eê]s/i.test(objective) && /[a-z]{3,}\s/iu.test(reply) && /[A-Za-z]/.test(reply)) {
    // heurística trivial: já está em PT na maioria dos casos
  }
  if (/curto|conciso/i.test(objective) && reply.length > 1200) return "pede resposta mais curta";
  return "";
}
