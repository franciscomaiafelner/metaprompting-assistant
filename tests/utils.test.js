const { JSDOM } = require('jsdom');
const { parseConversation, generateOptimizedPrompt, detectMisalignment } = require('../utils');

test('parseConversation extracts role and content', () => {
  const dom = new JSDOM(`\n    <div class="message" data-role="user">Hello</div>\n    <div class="message" data-role="assistant">Hi there</div>\n  `);
  const msgs = parseConversation(dom.window.document);
  expect(msgs).toEqual([
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there' }
  ]);
});

test('generateOptimizedPrompt includes objective and context', () => {
  const prompt = generateOptimizedPrompt('summarize', 'context text');
  expect(prompt).toMatch(/summarize/);
  expect(prompt).toMatch(/context text/);
});

test('detectMisalignment flags missing objective keyword', () => {
  const res = detectMisalignment('summarize', 'This is unrelated');
  expect(res.misaligned).toBe(true);
  expect(res.suggestion).toMatch(/summarize/);
});

test('detectMisalignment passes when keyword present', () => {
  const res = detectMisalignment('summarize', 'Please summarize this');
  expect(res.misaligned).toBe(false);
});
