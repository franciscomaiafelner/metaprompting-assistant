/**
 * Cria painel lateral (Shadow DOM) + API de UI para interação com a lógica.
 */
import "./sidebar.css";

let api = null;
let shadowRoot = null;

export function ensureSidebar() {
  if (shadowRoot) return shadowRoot;

  const host = document.createElement("div");
  host.id = "mpa-host";
  Object.assign(host.style, {
    position: "fixed",
    top: "0",
    right: "0",
    height: "100vh",
    width: "0px",
    zIndex: "2147483647"
  });
  document.documentElement.appendChild(host);

  shadowRoot = host.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `
    <div class="mpa-panel mpa-collapsed">
      <div class="mpa-header">
        <span class="mpa-title">Metaprompt</span>
        <button class="mpa-toggle" title="Abrir/Fechar">⟂</button>
      </div>
      <div class="mpa-body">
        <section class="mpa-section" id="mpa-context">
          <h4>Contexto (resumo)</h4>
          <div class="mpa-context-list"></div>
        </section>
        <section class="mpa-section" id="mpa-clarify">
          <h4>Clarificar</h4>
          <div class="mpa-questions"></div>
          <button class="mpa-btn" id="mpa-answer">Responder</button>
        </section>
        <section class="mpa-section" id="mpa-final">
          <h4>Prompt Final</h4>
          <textarea id="mpa-final-text" rows="8" placeholder="Ainda sem prompt..."></textarea>
          <div class="mpa-row">
            <button class="mpa-btn" id="mpa-generate">Gerar</button>
            <button class="mpa-btn primary" id="mpa-send">Enviar para AI original</button>
          </div>
        </section>
        <section class="mpa-section" id="mpa-adjust">
          <h4>Ajuste sugerido</h4>
          <div class="mpa-adjust-text"></div>
        </section>
      </div>
      <div class="mpa-toast" hidden></div>
    </div>
  `;

  wireEvents();
  api = makeUiApi();
  return shadowRoot;
}

function wireEvents() {
  const toggle = qs(".mpa-toggle");
  toggle?.addEventListener("click", () => {
    const panel = qs(".mpa-panel");
    panel?.classList.toggle("mpa-collapsed");
  });

  qs("#mpa-answer")?.addEventListener("click", () => {
    const answers = Array.from(qsa(".mpa-question input")).map((i) => i.value.trim());
    api?._onClarifyAnswer?.(answers);
  });

  qs("#mpa-generate")?.addEventListener("click", () => api?._onGeneratePrompt?.());
  qs("#mpa-send")?.addEventListener("click", () => api?._onSendPrompt?.());
}

function qs(sel) { return shadowRoot.querySelector(sel); }
function qsa(sel) { return shadowRoot.querySelectorAll(sel); }

function makeUiApi() {
  return {
    onClarifyAnswer(fn) { this._onClarifyAnswer = fn; },
    onGeneratePrompt(fn) { this._onGeneratePrompt = fn; },
    onSendPrompt(fn) { this._onSendPrompt = fn; },

    renderContextPreview(ctx) {
      const box = qs(".mpa-context-list");
      if (!box) return;
      box.innerHTML = "";
      (ctx?.messages || []).forEach((m, i) => {
        const div = document.createElement("div");
        div.className = "mpa-chip";
        div.textContent = `${m.role}: ${truncate(m.text, 120)}`;
        box.appendChild(div);
      });
      if (ctx?.userDraft) {
        const div = document.createElement("div");
        div.className = "mpa-chip draft";
        div.textContent = `draft: ${truncate(ctx.userDraft, 120)}`;
        box.appendChild(div);
      }
    },

    renderClarifyQuestions(questions) {
      const box = qs(".mpa-questions");
      if (!box) return;
      box.innerHTML = "";
      questions.forEach((q, idx) => {
        const row = document.createElement("div");
        row.className = "mpa-question";
        row.innerHTML = `
          <label>${q}</label>
          <input type="text" placeholder="Resposta curta..." />
        `;
        box.appendChild(row);
      });
    },

    renderFinalPrompt(text) {
      const ta = qs("#mpa-final-text");
      if (ta) ta.value = text || "";
    },

    showAdjustmentSuggestion(text) {
      const box = qs("#mpa-adjust .mpa-adjust-text");
      if (!box) return;
      box.textContent = text || "";
    },

    toast(msg, ms = 1800) {
      const el = qs(".mpa-toast");
      if (!el) return;
      el.textContent = msg;
      el.hidden = false;
      setTimeout(() => (el.hidden = true), ms);
    }
  };
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export const ui = new Proxy({}, {
  get(_, prop) { return api?.[prop]; }
});
