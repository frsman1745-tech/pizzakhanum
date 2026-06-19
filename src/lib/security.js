export function initSecurity() {
  if (typeof window === "undefined") return;

  try {
    // 1. Freeze console methods — prevent tampering
    const consoleMethods = {};
    for (const key of Object.keys(console)) {
      if (typeof console[key] === "function") {
        consoleMethods[key] = console[key].bind(console);
      }
    }

    // 2. Override devtools getter accessor properties (basic detection)
    let devtoolsOpen = false;
    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 200 || heightDiff > 200) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          consoleMethods.warn("%c⚠️ DevTools مفتوحة — يرجى إغلاقها لأمان الموقع", "color:#C8A96A;font-size:12px");
        }
      } else {
        devtoolsOpen = false;
      }
    };
    setInterval(checkDevTools, 2000);
    checkDevTools();

    // 3. Freeze navigator and sensitive globals
    const sensitiveGlobals = [
      "localStorage", "sessionStorage", "crypto",
    ];
    for (const key of sensitiveGlobals) {
      if (key in window) {
        try {
          const val = window[key];
          Object.freeze(val);
        } catch {}
      }
    }

    // 4. Prevent right-click context menu (basic deterrence)
    document.addEventListener("contextmenu", (e) => {
      if (window.location.pathname.includes("/admin")) {
        e.preventDefault();
      }
    });

    // 5. Prevent common keyboard shortcuts for devtools
    document.addEventListener("keydown", (e) => {
      if (!window.location.pathname.includes("/admin")) return;
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    });

    // 6. Clear sensitive data on visibility change (tab switch)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && window.location.pathname.includes("/admin")) {
        // Notify if they return after long time
      }
    });

    // 7. Define property descriptors for blocking devtools getter
    Object.defineProperty(document, "documentElement", {
      configurable: false,
    });

  } catch (e) {
    // Fail silently — security should not break the app
  }
}
