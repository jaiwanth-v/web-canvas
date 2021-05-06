/* eslint-disable no-undef */
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "toggleExtension") {
    let overlay = document.getElementById("canvas-overlay");
    if (overlay) {
      console.log(overlay.style.display);
      overlay.style.display =
        overlay.style.display === "none" ? "block" : "none";
      return;
    }
    overlay = document.createElement("div");
    overlay.setAttribute(
      "style",
      "height:100vh;width:100vw;position:fixed;top:0;left:0;z-index:21212;background:aliceblue;"
    );
    overlay.setAttribute("id", "canvas-overlay");
    overlay.innerHTML = `<iframe id="canvas-iframe"/>`;
    document.body.appendChild(overlay);
    const iframe = document.getElementById("canvas-iframe");
    iframe.src = chrome.extension.getURL("index.html");
    iframe.frameBorder = 0;
    iframe.setAttribute("style", "height:100vh;width:100vw;");
  }
});
