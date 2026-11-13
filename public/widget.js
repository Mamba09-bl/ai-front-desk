(function () {
  // 1. Get the script that loaded this file
  const script = document.currentScript;

  if (!script) {
    console.warn("Chat widget: Unable to identify script element.");
    return;
  }

  // 2. Read public key and application URL
  const publicKey = script.dataset.key;
  const origin = new URL(script.src).origin;

  if (!publicKey) {
    console.warn("Chat widget: Missing data-key attribute.");
    return;
  }

  // 3. Prevent duplicate widgets
  if (document.getElementById("nga-widget-bubble")) {
    return;
  }

  // 4. Create chat bubble
  const bubble = document.createElement("button");
  bubble.id = "nga-widget-bubble";
  bubble.type = "button";
  bubble.textContent = "💬";

  Object.assign(bubble.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "26px",
    cursor: "pointer",
    zIndex: "2147483647",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  });

  // 5. Create iframe container (initially hidden)
  const frame = document.createElement("iframe");
  frame.id = "nga-widget-frame";
  frame.title = "Business AI Assistant";

  Object.assign(frame.style, {
    position: "fixed",
    bottom: "95px",
    right: "20px",
    width: "380px",
    height: "600px",
    maxWidth: "calc(100vw - 40px)",
    maxHeight: "calc(100dvh - 115px)",
    border: "none",
    borderRadius: "16px",
    boxShadow: "0 5px 25px rgba(0,0,0,0.2)",
    zIndex: "2147483646",
    display: "none",
    background: "#fff",
  });

  // 6. Open/close behavior
  let isOpen = false;
  let iframeLoaded = false;

  bubble.addEventListener("click", function () {
    isOpen = !isOpen;

    if (isOpen) {
      if (!iframeLoaded) {
        frame.src = `${origin}/widget/${encodeURIComponent(publicKey)}`;
        iframeLoaded = true;
      }

      frame.style.display = "block";
      bubble.textContent = "✕";
      bubble.setAttribute("aria-label", "Close chat");
    } else {
      frame.style.display = "none";
      bubble.textContent = "💬";
      bubble.setAttribute("aria-label", "Open chat");
    }
  });

  // 7. Make it full screen on phones
  const mediaQuery = window.matchMedia("(max-width: 480px)");

  function adjustFrame() {
    if (mediaQuery.matches) {
      Object.assign(frame.style, {
        width: "100vw",
        height: "100dvh",
        maxWidth: "100vw",
        maxHeight: "100dvh",
        bottom: "0",
        right: "0",
        borderRadius: "0",
      });
    } else {
      Object.assign(frame.style, {
        width: "380px",
        height: "600px",
        maxWidth: "calc(100vw - 40px)",
        maxHeight: "calc(100dvh - 115px)",
        bottom: "95px",
        right: "20px",
        borderRadius: "16px",
      });
    }
  }

  mediaQuery.addEventListener("change", adjustFrame);
  adjustFrame();

  // 8. Add elements to the website
  document.body.appendChild(frame);
  document.body.appendChild(bubble);
})();
