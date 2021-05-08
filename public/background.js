/* eslint-disable no-undef */
chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "toggleExtension" });
  });
});

chrome.runtime.onMessage.addListener((request) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.browserAction.setIcon({
      tabId: tabs[0].id,
      path:
        request.message === "enableIcon"
          ? "pencil-active128.png"
          : "pencil128.png",
    });
  });
});
