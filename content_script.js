function collectConversation() {
  const nodes = document.querySelectorAll('[data-message-id]');
  return Array.from(nodes).map((el) => ({
    role: el.getAttribute('data-message-author') || '',
    content: el.textContent.trim()
  }));
}

function injectPrompt(prompt) {
  const textarea = document.querySelector('textarea');
  if (!textarea) return;
  textarea.value = prompt;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  const sendBtn = textarea.closest('form')?.querySelector("button[type='submit']");
  sendBtn && sendBtn.click();
}

function handleMessage(message, sender, sendResponse) {
  if (message.type === 'get-conversation') {
    sendResponse({ conversation: collectConversation() });
  }
  if (message.type === 'inject-prompt') {
    injectPrompt(message.prompt);
  }
}

chrome.runtime.onMessage.addListener(handleMessage);

const observer = new MutationObserver(() => {
  chrome.runtime.sendMessage({ type: 'conversation-update', conversation: collectConversation() });
});
observer.observe(document.body, { childList: true, subtree: true });

if (typeof module !== 'undefined') {
  module.exports = { collectConversation, injectPrompt, handleMessage };
}
