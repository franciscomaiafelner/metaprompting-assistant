describe('content_script functions', () => {
  beforeEach(() => {
    jest.resetModules();
    global.chrome = { runtime: { sendMessage: jest.fn(), onMessage: { addListener: jest.fn() } } };
    document.body.innerHTML = `
      <div data-message-id="1" data-message-author="user">Hi</div>
      <div data-message-id="2" data-message-author="assistant">Hello</div>
      <form><textarea></textarea><button type="submit"></button></form>
    `;
  });

  test('collectConversation gathers messages', () => {
    const { collectConversation } = require('../content_script');
    const conv = collectConversation();
    expect(conv.length).toBe(2);
    expect(conv[0].role).toBe('user');
  });

  test('injectPrompt sets textarea and clicks send', () => {
    const { injectPrompt } = require('../content_script');
    const btn = document.querySelector('button');
    const clickSpy = jest.spyOn(btn, 'click');
    injectPrompt('hello world');
    expect(document.querySelector('textarea').value).toBe('hello world');
    expect(clickSpy).toHaveBeenCalled();
  });

  test('handleMessage routes messages', () => {
    const mod = require('../content_script');
    const sendResponse = jest.fn();
    mod.handleMessage({ type: 'get-conversation' }, {}, sendResponse);
    expect(sendResponse).toHaveBeenCalled();
    const spy = jest.spyOn(mod, 'injectPrompt');
    mod.handleMessage({ type: 'inject-prompt', prompt: 'x' });
    expect(spy).toHaveBeenCalledWith('x');
  });
});
