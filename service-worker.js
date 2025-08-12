let chatGPTTabId = null;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    tab.url &&
    (tab.url.startsWith('https://chat.openai.com/') ||
      tab.url.startsWith('https://chatgpt.com/'))
  ) {
    chatGPTTabId = tabId;
    chrome.sidePanel.setOptions({ tabId, path: 'sidepanel.html' });
    chrome.sidePanel.show(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === chatGPTTabId) {
    chatGPTTabId = null;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!chatGPTTabId) {
    return;
  }
  if (message.type === 'request-conversation') {
    chrome.tabs.sendMessage(chatGPTTabId, { type: 'get-conversation' }, sendResponse);
    return true; // keep sendResponse
  }
  if (message.type === 'send-prompt') {
    chrome.tabs.sendMessage(chatGPTTabId, { type: 'inject-prompt', prompt: message.prompt });
  }
});
