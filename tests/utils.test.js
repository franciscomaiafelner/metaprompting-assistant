const test = require('node:test');
const assert = require('node:assert');
const { parseConversation, generateOptimizedPrompt, detectMisalignment } = require('../utils');

test('parseConversation extracts role and content', () => {
  const doc = {
    querySelectorAll: () => [
      {
        getAttribute: () => 'user',
        textContent: 'Hello'
      },
      {
        getAttribute: () => 'assistant',
        textContent: 'Hi there'
      }
    ]
  };
  const msgs = parseConversation(doc);
  assert.deepStrictEqual(msgs, [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there' }
  ]);
});

test('generateOptimizedPrompt includes objective and context', () => {
  const prompt = generateOptimizedPrompt('summarize', 'context text');
  assert.ok(prompt.includes('summarize'));
  assert.ok(prompt.includes('context text'));
});

test('detectMisalignment flags missing objective keyword', () => {
  const res = detectMisalignment('summarize', 'This is unrelated');
  assert.strictEqual(res.misaligned, true);
  assert.ok(res.suggestion.includes('summarize'));
});

test('detectMisalignment passes when keyword present', () => {
  const res = detectMisalignment('summarize', 'Please summarize this');
  assert.strictEqual(res.misaligned, false);
});
