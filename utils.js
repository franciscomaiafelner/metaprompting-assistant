function parseConversation(doc) {
  const nodes = doc.querySelectorAll('.message');
  return Array.from(nodes).map((el) => ({
    role: el.getAttribute('data-role') || '',
    content: el.textContent.trim()
  }));
}

function generateOptimizedPrompt(objective, context = '') {
  return `You are to ${objective.trim()}\nContext: ${context.trim()}`.trim();
}

function detectMisalignment(objective, aiResponse) {
  const key = objective.split(' ')[0].toLowerCase();
  const aligned = aiResponse.toLowerCase().includes(key);
  return aligned ? { misaligned: false } : { misaligned: true, suggestion: `Response may not address ${key}` };
}

if (typeof module !== 'undefined') {
  module.exports = { parseConversation, generateOptimizedPrompt, detectMisalignment };
}
