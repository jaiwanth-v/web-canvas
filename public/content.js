/* eslint-disable no-undef */
let boundingX, boundingY, containerWidth, containerHeight;

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "toggleExtension") {
    let overlay = document.getElementById("canvas-overlay");
    if (overlay) {
      overlay.style.display =
        overlay.style.display === "none" ? "block" : "none";
      return;
    }
    overlay = document.createElement("div");
    overlay.setAttribute(
      "style",
      "height:0;width:0;position:fixed;top:0;left:0;z-index:121332323;background:transparent;color-scheme:light !important"
    );
    overlay.setAttribute("id", "canvas-overlay");
    overlay.innerHTML = `<iframe id="canvas-iframe"/>`;
    document.body.appendChild(overlay);
    const iframe = document.getElementById("canvas-iframe");
    iframe.src = chrome.extension.getURL("index.html");
    iframe.frameBorder = 0;
    iframe.setAttribute("style", "height:100vh;width:100vw;");
    document.addEventListener("mousemove", (e) => {
      if (
        e.clientX > boundingX &&
        e.clientX < boundingX + containerWidth &&
        e.clientY < boundingY + containerHeight &&
        e.clientY > boundingY
      )
        document.getElementById("canvas-iframe").style.pointerEvents = "auto";
    });
  }

  if (request.type === "disable-pointer-events") {
    const { x, y, width, height } = request.data;
    boundingX = x;
    boundingY = y;
    containerWidth = width;
    containerHeight = height;
    document.getElementById("canvas-iframe").style.pointerEvents = "none";
  }
  if (request.type === "enable-pointer-events") {
    document.getElementById("canvas-iframe").style.pointerEvents = "auto";
  }
});
