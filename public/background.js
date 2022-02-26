/* eslint-disable no-undef */
chrome.action.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "toggleExtension" });
  });
});

chrome.runtime.onMessage.addListener((request) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.action.setIcon({
      tabId: tabs[0].id,
      path:
        request.message === "enableIcon"
          ? "pencil-active128.png"
          : "pencil128.png",
    });
  });
});
