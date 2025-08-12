const conversationDiv = document.getElementById('conversation');
const objectiveInput = document.getElementById('objective');
const clarifyBtn = document.getElementById('clarify-btn');
const promptSection = document.getElementById('prompt-section');
const finalPrompt = document.getElementById('final-prompt');
const sendBtn = document.getElementById('send-btn');
const suggestionDiv = document.getElementById('suggestion');

chrome.runtime.sendMessage({ type: 'request-conversation' }, (res) => {
  if (res && res.conversation) {
    conversationDiv.textContent = res.conversation.map(m => `${m.role}: ${m.content}`).join('\n');
  }
});

clarifyBtn.addEventListener('click', () => {
  const objective = objectiveInput.value.trim();
  if (!objective) return;
  const context = conversationDiv.textContent;
  const prompt = generateOptimizedPrompt(objective, context);
  finalPrompt.value = prompt;
  promptSection.style.display = 'block';
});

sendBtn.addEventListener('click', () => {
  const prompt = finalPrompt.value;
  chrome.runtime.sendMessage({ type: 'send-prompt', prompt });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'conversation-update' && msg.conversation) {
    const last = msg.conversation[msg.conversation.length - 1];
    const objective = objectiveInput.value.trim();
    const result = detectMisalignment(objective, last.content);
    if (result.misaligned) {
      suggestionDiv.textContent = result.suggestion;
    } else {
      suggestionDiv.textContent = '';
    }
  }
});
