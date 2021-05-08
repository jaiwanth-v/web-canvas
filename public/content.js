/* eslint-disable no-undef */
function makeHttpObject() {
  try {
    return new XMLHttpRequest();
  } catch (error) {}
  try {
    return new ActiveXObject("Msxml2.XMLHTTP");
  } catch (error) {}
  try {
    return new ActiveXObject("Microsoft.XMLHTTP");
  } catch (error) {}

  throw new Error("Could not create HTTP request object.");
}

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
      "height:100vh;width:100vw;position:fixed;top:0;left:0;z-index:121332323;background:transparent;color-scheme:light !important"
    );
    overlay.setAttribute("id", "canvas-overlay");
    overlay.innerHTML = `<iframe id="canvas-iframe"/>`;
    document.body.appendChild(overlay);
    const iframe = document.getElementById("canvas-iframe");
    iframe.src = chrome.extension.getURL("index.html");
    // var req = makeHttpObject();
    // req.open("GET", chrome.extension.getURL("index.html"), true);
    // req.send(null);
    // req.onreadystatechange = function () {
    //   let res = req.responseText.replaceAll(
    //     "/static",
    //     chrome.extension.getURL("static")
    //   );
    //   console.log(res);
    //   overlay.innerHTML = res;
    //   Array.from(overlay.querySelectorAll("script")).forEach((oldScript) => {
    //     const newScript = document.createElement("script");
    //     Array.from(oldScript.attributes).forEach((attr) =>
    //       newScript.setAttribute(attr.name, attr.value)
    //     );
    //     newScript.appendChild(document.createTextNode(oldScript.innerHTML));
    //     oldScript.parentNode.replaceChild(newScript, oldScript);
    //   });
    //   console.log(req.responseText);
    // };
    // console.log(iframe.src);
    iframe.frameBorder = 0;
    iframe.setAttribute("style", "height:100vh;width:100vw;");
  }
});
