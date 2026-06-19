export function initSecurity() {
  if (typeof window === "undefined") return;
  try {
    const isAdmin = () => window.location.pathname.includes("/admin");

    // 1. Prevent right-click on admin
    document.addEventListener("contextmenu", (e) => { if (isAdmin()) e.preventDefault(); });

    // 2. Block common devtools shortcuts on admin
    document.addEventListener("keydown", (e) => {
      if (!isAdmin()) return;
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) || (e.ctrlKey && e.key === "U")) {
        e.preventDefault();
      }
    });

    // 3. Devtools detection via size diff (warning only)
    setInterval(() => {
      if (isAdmin() && (window.outerWidth - window.innerWidth > 200 || window.outerHeight - window.innerHeight > 200)) {
        console.warn("%c⚠️ يرجى إغلاق DevTools", "color:#C8A96A;font-size:12px");
      }
    }, 3000);
  } catch (e) {}
}
