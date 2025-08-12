/**
 * Estado único do assistente.
 */
const _state = {
  objective: "",
  clarifications: [], // respostas curtas às perguntas
  context: { messages: [], userDraft: "" },
  finalPrompt: "",
  lastPromptSent: "",
  maxClarifyQuestions: 2,
  historyWindow: 6,
  confidenceThreshold: 0.65
};

export function init(opts = {}) {
  Object.assign(_state, opts);
}

export function get() { return _state; }
export function getContext() { return _state.context; }
export function updateContext(ctx) { _state.context = ctx; inferObjectiveFromDraft(ctx?.userDraft); }
export function setObjective(o) { _state.objective = (o || "").trim(); }
export function getObjective() { return _state.objective; }
export function pushUserClarifications(arr = []) {
  _state.clarifications.push(...arr.filter(Boolean));
  if (!_state.objective && arr[0]) _state.objective = arr[0]; // heurística leve
}
export function getClarifications() { return _state.clarifications; }
export function setFinalPrompt(p) { _state.finalPrompt = p; }
export function getFinalPrompt() { return _state.finalPrompt; }
export function setLastPromptSent(p) { _state.lastPromptSent = p; }
export function getLastPromptSent() { return _state.lastPromptSent; }

function inferObjectiveFromDraft(draft = "") {
  if (!draft) return;
  // heurística simples: primeira frase como objetivo inicial
  const first = draft.split(/[.!?\n]/)[0];
  if (first && first.length > 4) _state.objective = _state.objective || first.trim();
}
