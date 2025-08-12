/**
 * Injeta texto no textarea e simula “Enter” para enviar ao ChatGPT.
 */
import { getTextareaEl } from "./domReader.js";

export async function injectAndSend(text) {
  const el = getTextareaEl();
  if (!el) return false;

  // Escrever no textarea com eventos reais
  el.focus();
  el.value = text;
  el.dispatchEvent(new Event("input", { bubbles: true }));

  // Tentar enviar com Enter
  const ok = simulateEnter(el);
  if (!ok) {
    // Fallback: tenta clicar no botão de enviar
    const btn = findSendButton();
    if (btn) btn.click();
  }
  return true;
}

function simulateEnter(el) {
  const ev = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    which: 13,
    keyCode: 13,
    bubbles: true
  });
  return el.dispatchEvent(ev);
}

function findSendButton() {
  // Heurística: botões perto do textarea com ícone de enviar
  const footer = elClosest(getTextareaEl(), "form, footer, div");
  if (footer) {
    const btn = footer.querySelector('button[type="submit"], button[aria-label*="send" i]');
    if (btn) return btn;
  }
  return document.querySelector('button[type="submit"]');
}

function elClosest(el, sel) {
  try { return el?.closest(sel) || null; } catch { return null; }
}
