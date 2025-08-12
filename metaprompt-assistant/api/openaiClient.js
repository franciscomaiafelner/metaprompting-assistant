/**
 * Stub para futura integração OpenAI.
 * TODO: implementar fetch para completions/chat usando apiKey do chrome.storage.
 */
export async function complete({ system, user, model = "gpt-4o-mini", temperature = 0.2 }) {
  throw new Error("OpenAI client ainda não implementado no MVP.");
}
