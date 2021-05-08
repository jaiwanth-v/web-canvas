/* eslint-disable no-undef */
chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "toggleExtension" });
  });
});

chrome.runtime.onMessage.addListener((request) => {
  chrome.browserAction.setIcon({
    path:
      request.message === "enableIcon"
        ? "pencil-active128.png"
        : "pencil128.png",
  });
  console.log(request);
});
