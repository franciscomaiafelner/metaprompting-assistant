/**
 * Ponto de entrada no site do ChatGPT:
 * - Injeta painel (Shadow DOM) via sidebar.js
 * - Inicializa leitura de contexto (domReader) e observer de novas mensagens
 * - Orquestra fluxo Clarify -> Prompt Final -> Envio -> Acompanhamento
 */
import { ensureSidebar, ui } from "./sidebar.js";
import { readContext, getTextareaEl, getMessages } from "./domReader.js";
import { observeAssistantReplies } from "./observer.js";
import { injectAndSend } from "./sendToChatGPT.js";
import * as State from "../logic/state.js";
import { nextQuestions } from "../logic/clarifier.js";
import { buildPrompt } from "../logic/promptBuilder.js";
import { checkAlignment } from "../logic/alignChecker.js";

(async function init() {
  console.log("[MPA] content init");
  const settings = await sendRuntime("GET_SETTINGS");

  // Cria/garante painel
  const sidebar = ensureSidebar();

  // Estado inicial
  State.init({
    maxClarifyQuestions: settings.data.maxClarifyQuestions,
    historyWindow: settings.data.historyWindow,
    confidenceThreshold: settings.data.confidenceThreshold
  });

  // Primeira leitura de contexto
  await refreshContext();

  // UI events
  ui.onClarifyAnswer(async (answers) => {
    State.pushUserClarifications(answers);
    await maybeBuildOrAsk();
  });

  ui.onGeneratePrompt(async () => {
    await maybeBuildOrAsk(true);
  });

  ui.onSendPrompt(async () => {
    const prompt = State.getFinalPrompt();
    if (!prompt) {
      ui.toast("Nenhum prompt final ainda.");
      return;
    }
    const ok = await injectAndSend(prompt);
    if (ok) {
      State.setLastPromptSent(prompt);
      ui.toast("Prompt enviado 🚀");
    } else {
      ui.toast("Falha ao enviar prompt.");
    }
  });

  // Observa novas respostas da IA para sugerir ajustes
  observeAssistantReplies(async (newMessageNode) => {
    const text = getNodeText(newMessageNode);
    const suggestion = checkAlignment({
      objective: State.getObjective(),
      lastPrompt: State.getLastPromptSent(),
      assistantReply: text
    });
    if (suggestion) ui.showAdjustmentSuggestion(suggestion);
  });

  // Refresh periódicos leves (o DOM muda)
  const int = setInterval(refreshContext, 2500);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") clearInterval(int);
  });

  async function refreshContext() {
    const ctx = readContext({
      historyWindow: State.get().historyWindow
    });
    State.updateContext(ctx);
    ui.renderContextPreview(ctx);
  }

  async function maybeBuildOrAsk(forceGenerate = false) {
    const ctx = State.getContext();
    const questions = nextQuestions({
      context: ctx,
      objective: State.getObjective(),
      clarifications: State.getClarifications(),
      max: State.get().maxClarifyQuestions,
      confidenceThreshold: State.get().confidenceThreshold
    });

    if (!forceGenerate && questions.length > 0) {
      ui.renderClarifyQuestions(questions);
      return;
    }

    const prompt = buildPrompt({
      context: ctx,
      objective: State.getObjective(),
      clarifications: State.getClarifications()
    });
    State.setFinalPrompt(prompt);
    ui.renderFinalPrompt(prompt);
  }
})().catch((e) => console.error("[MPA] init error", e));

function getNodeText(node) {
  if (!node) return "";
  const clone = node.cloneNode(true);
  // remove code blocks to reduce noise in heuristic
  clone.querySelectorAll("pre, code").forEach((n) => n.remove());
  return clone.innerText || "";
}

function sendRuntime(type, payload) {
  return new Promise((resolve) =>
    chrome.runtime.sendMessage({ type, payload }, resolve)
  );
}
