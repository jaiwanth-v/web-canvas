/* eslint-disable no-undef */
let boundingX, boundingY, containerWidth, containerHeight;

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.type === "toggleExtension") {
    let overlay = document.getElementById("canvas-overlay");
    if (overlay) {
      chrome.runtime.sendMessage({
        message:
          overlay.style.display === "none" ? "enableIcon" : "disableIcon",
      });
      overlay.style.display =
        overlay.style.display === "none" ? "block" : "none";
      return;
    }
    chrome.runtime.sendMessage({
      message: "enableIcon",
    });

    overlay = document.createElement("div");
    overlay.setAttribute(
      "style",
      "height:0;width:0;position:fixed;top:0;left:0;z-index:2147483647 !important;background:transparent;color-scheme:light !important"
    );
    overlay.setAttribute("id", "canvas-overlay");
    overlay.innerHTML = `<iframe id="canvas-iframe"/>`;
    document.body.appendChild(overlay);
    const iframe = document.getElementById("canvas-iframe");
    iframe.src = chrome.runtime.getURL("index.html");
    iframe.frameBorder = 0;
    iframe.setAttribute(
      "style",
      "height:100vh;width:100vw;max-width:none !important"
    );
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

  else if (request.type === "disable-pointer-events") {
    const { x, y, width, height } = request.data;
    boundingX = x;
    boundingY = y;
    containerWidth = width;
    containerHeight = height;
    document.getElementById("canvas-iframe").style.pointerEvents = "none";
  }
  else if (request.type === "enable-pointer-events") {
    document.getElementById("canvas-iframe").style.pointerEvents = "auto";
  }
  else if (request.type === "copy-to-clipboard") {
    const dataURI = request.data;
    const res = await fetch(dataURI);
    const blob = await res.blob();
    navigator.clipboard.write([new ClipboardItem({
      [blob.type]: blob
    })]);
  }
});
