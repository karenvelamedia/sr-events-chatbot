(function () {
  if (window.__srEventsChatLoaded) return;
  window.__srEventsChatLoaded = true;

  var currentScript =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();
  var baseUrl = new URL(currentScript.src).origin;
  var chatUrl = baseUrl + "/embed/chat";

  var style = document.createElement("style");
  style.textContent = [
    "#sre-chat-button{position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;background:#0f172a;color:#fff;border:none;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;z-index:2147483646;transition:transform .15s ease,box-shadow .15s ease;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}",
    "#sre-chat-button:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.22);}",
    "#sre-chat-button svg{width:28px;height:28px;}",
    "#sre-chat-panel{position:fixed;right:20px;bottom:20px;width:380px;height:600px;max-width:calc(100vw - 40px);max-height:calc(100dvh - 40px);background:#fff;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.24);overflow:hidden;display:none;flex-direction:column;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}",
    "#sre-chat-panel.sre-open{display:flex;}",
    "#sre-chat-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#0f172a;color:#fff;flex-shrink:0;}",
    "#sre-chat-title{font-size:15px;font-weight:600;letter-spacing:.2px;}",
    "#sre-chat-close{background:transparent;color:#fff;border:none;font-size:24px;line-height:1;cursor:pointer;padding:0 4px;opacity:.85;}",
    "#sre-chat-close:hover{opacity:1;}",
    "#sre-chat-frame{flex:1;width:100%;border:0;background:#fff;}",
    "@media (max-width:480px){#sre-chat-panel{right:0;bottom:0;width:100vw;height:100dvh;max-width:100vw;max-height:100dvh;border-radius:0;}}",
  ].join("");
  document.head.appendChild(style);

  var button = document.createElement("button");
  button.id = "sre-chat-button";
  button.setAttribute("aria-label", "Åpne chat");
  button.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

  var panel = document.createElement("div");
  panel.id = "sre-chat-panel";
  panel.innerHTML =
    '<div id="sre-chat-header"><span id="sre-chat-title">Chat med oss</span><button id="sre-chat-close" aria-label="Lukk chat">×</button></div>' +
    '<iframe id="sre-chat-frame" title="SR Events chat" loading="lazy"></iframe>';

  var iframeLoaded = false;
  function openPanel() {
    if (!iframeLoaded) {
      panel.querySelector("#sre-chat-frame").src = chatUrl;
      iframeLoaded = true;
    }
    panel.classList.add("sre-open");
    button.style.display = "none";
  }
  function closePanel() {
    panel.classList.remove("sre-open");
    button.style.display = "flex";
  }

  function init() {
    document.body.appendChild(button);
    document.body.appendChild(panel);
    button.addEventListener("click", openPanel);
    panel.querySelector("#sre-chat-close").addEventListener("click", closePanel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
