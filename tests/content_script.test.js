const test = require('node:test');
const assert = require('node:assert');

function createSpy() {
  const fn = (...args) => {
    fn.called = true;
    fn.calls.push(args);
  };
  fn.called = false;
  fn.calls = [];
  return fn;
}

function setup() {
  const buttonClick = createSpy();
  const button = { click: buttonClick };
  const form = { querySelector: () => button };
  const textarea = {
    value: '',
    dispatchEvent: () => {},
    closest: () => form
  };
  global.document = {
    querySelectorAll: () => [
      { getAttribute: () => 'user', textContent: 'Hi' },
      { getAttribute: () => 'assistant', textContent: 'Hello' }
    ],
    querySelector: (sel) => (sel === 'textarea' ? textarea : null),
    body: {}
  };
  global.chrome = {
    runtime: {
      sendMessage: createSpy(),
      onMessage: { addListener: createSpy() }
    }
  };
  global.MutationObserver = class {
    constructor() {}
    observe() {}
  };
  delete require.cache[require.resolve('../content_script')];
  const mod = require('../content_script');
  return { mod, textarea, buttonClick };
}

test('collectConversation gathers messages', () => {
  const { mod } = setup();
  const conv = mod.collectConversation();
  assert.strictEqual(conv.length, 2);
  assert.strictEqual(conv[0].role, 'user');
});

test('injectPrompt sets textarea and clicks send', () => {
  const { mod, textarea, buttonClick } = setup();
  mod.injectPrompt('hello world');
  assert.strictEqual(textarea.value, 'hello world');
  assert.strictEqual(buttonClick.called, true);
});

test('handleMessage routes messages', () => {
  const { mod, textarea, buttonClick } = setup();
  const sendResponse = createSpy();
  mod.handleMessage({ type: 'get-conversation' }, {}, sendResponse);
  assert.strictEqual(sendResponse.called, true);
  mod.handleMessage({ type: 'inject-prompt', prompt: 'x' });
  assert.strictEqual(textarea.value, 'x');
  assert.strictEqual(buttonClick.called, true);
});
