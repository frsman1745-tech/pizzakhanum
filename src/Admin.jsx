// src/Admin.jsx
// Thin auth gate + dashboard shell — replaces the 800-line monolith.
// Password is verified SERVER-SIDE via /api/auth/verify.
// JWT is stored in Zustand (memory only), never in localStorage.

import { useState, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useUiStore from "./store/uiStore.js";
import { loginAdmin } from "./services/api.js";
import { useMenu, useFeatured } from "./hooks/usePizzas.js";
import { useToast } from "./hooks/useToast.js";
import Toast   from "./components/ui/Toast.jsx";
import Modal   from "./components/ui/Modal.jsx";
import MenuTab from "./features/admin/MenuTab.jsx";
import { FeaturedTab, HistoryTab, SettingsTab } from "./features/admin/AdminTabs.jsx";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onAuthed }) {
  const [pass,    setPass]    = useState("");
  const [authErr, setAuthErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e) {
    e.preventDefault();
    setLoading(true);
    setAuthErr("");
    try {
      const token = await loginAdmin(pass);
      onAuthed(token);
    } catch (e) {
      setAuthErr(e.message || "كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 30% 40%,#1f1508,#0a0a0a)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font)", direction: "rtl" }}>
      <div className="anim-in" style={{ background: "#141414", border: "1px solid var(--gold-alpha-10)", borderRadius: 20, padding: "34px 28px", width: "min(340px,95vw)", textAlign: "center" }}>
        <div style={{ fontSize: "2.8rem", marginBottom: 10 }}>🍕</div>
        <h1 style={{ color: "var(--gold)", fontSize: "1.1rem", marginBottom: 4 }}>بيتزا خانم</h1>
        <p style={{ fontSize: ".68rem", color: "#333", marginBottom: 22 }}>لوحة التحكم</p>

        {authErr && (
          <div style={{ background: "#1a0808", border: "1px solid var(--red-alpha)", borderRadius: 9, padding: "8px 12px", marginBottom: 14, fontSize: ".78rem", color: "var(--red)" }}>
            ⚠ {authErr}
          </div>
        )}

        {/* Note: HTML <form> works fine here — this is a standalone page, not an artifact */}
        <form onSubmit={login}>
          <input type="password" placeholder="كلمة المرور" value={pass} onChange={(e) => setPass(e.target.value)} className="admin-input" required style={{ marginBottom: 12 }} />
          <button type="submit" className="btn-primary" style={{ width: "100%", padding: "11px" }} disabled={loading}>
            {loading ? "جاري التحقق..." : "دخول →"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Dashboard Shell ───────────────────────────────────────────────────────────
function Dashboard() {
  const { adminToken, logout } = useUiStore();
  const { data: menuData }     = useMenu();
  const { data: featuredData } = useFeatured();
  const { toast, showToast }   = useToast();

  const menu     = menuData     || [];
  const featured = featuredData || [];

  const [tab,         setTab]         = useState("menu");
  const [history,     setHistory]     = useState(() => lsGet("admin_history", []));
  const [confirmDlg,  setConfirmDlg]  = useState(null);
  const impRef = useRef(null);

  function log(action) {
    const entry = { a: action, t: new Date().toLocaleTimeString("ar-EG") };
    setHistory((prev) => { const n = [entry, ...prev].slice(0, 60); lsSet("admin_history", n); return n; });
  }

  function confirm_(msg, onOk) { setConfirmDlg({ msg, onOk }); }

  function exportData() {
    const d = JSON.stringify({ menu, featured, exportedAt: new Date().toISOString() }, null, 2);
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([d], { type: "application/json" })), download: "pizzakhanum-backup.json" });
    a.click();
    showToast("📦 تم التصدير");
  }

  async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = async (ev) => {
      try {
        const p = JSON.parse(ev.target.result);
        const items = [...(p.menu || []), ...(p.featured || [])];
        let c = 0;
        for (const item of items) {
          const res = await fetch("/api/pizzas", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` }, body: JSON.stringify(item) });
          if (res.ok) c++;
        }
        showToast(`📥 تم استيراد ${c} صنف`);
        log("استيراد");
      } catch { showToast("⚠ ملف غير صالح", "err"); }
    };
    r.readAsText(file);
    e.target.value = "";
  }

  const stats = [
    { l: "القائمة",  v: menu.length,                            c: "var(--gold)",  i: "🍕" },
    { l: "ظاهر",    v: menu.filter((p) => !p.comingSoon).length, c: "var(--green)", i: "✅" },
    { l: "قريباً",  v: menu.filter((p) =>  p.comingSoon).length, c: "var(--red)",   i: "⏳" },
    { l: "المميزة", v: featured.length,                         c: "var(--blue)",  i: "⭐" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", direction: "rtl" }}>
      <Toast toast={toast} />

      {/* Confirm Dialog */}
      {confirmDlg && (
        <Modal onClose={() => setConfirmDlg(null)} variant="centered" zIndex={1100}>
          <p style={{ fontSize: "1.6rem", marginBottom: 10 }}>🗑</p>
          <p style={{ color: "var(--text-primary)", fontSize: ".86rem", marginBottom: 20, lineHeight: 1.6 }}>{confirmDlg.msg}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn-danger" style={{ padding: "10px 20px", fontWeight: 700 }} onClick={() => { confirmDlg.onOk(); setConfirmDlg(null); }}>تأكيد الحذف</button>
            <button className="btn-ghost" onClick={() => setConfirmDlg(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div style={{ background: "#111", borderBottom: "1px solid var(--border-subtle)", padding: "11px 15px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.3rem" }}>🍕</span>
          <div><h1 style={{ fontSize: ".88rem", fontWeight: 900, color: "var(--gold)" }}>بيتزا خانم</h1><p style={{ fontSize: ".55rem", color: "var(--text-disabled)" }}>لوحة التحكم</p></div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <button className="btn-icon" onClick={exportData} title="تصدير">📦</button>
          <label className="btn-icon" style={{ cursor: "pointer" }} title="استيراد">📥<input ref={impRef} type="file" accept=".json" onChange={importData} style={{ display: "none" }} /></label>
          <button className="btn-icon" onClick={() => logout()} style={{ background: "#1a1010", border: "1px solid rgba(239,68,68,.1)", color: "#444" }}>خروج</button>
        </div>
      </div>

      <div style={{ padding: "14px 14px 70px", maxWidth: 720, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginBottom: 14 }}>
          {stats.map((s) => (
            <div key={s.l} style={{ background: "#141414", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "10px 7px", textAlign: "center" }}>
              <div style={{ fontSize: ".9rem", marginBottom: 2 }}>{s.i}</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: ".56rem", color: "#2e2e2e", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 5, marginBottom: 11, flexWrap: "wrap", alignItems: "center" }}>
          {[["menu", "🍕 القائمة"], ["featured", "⭐ المميزة"], ["history", "📋 السجل"], ["settings", "⚙️ الإعدادات"]].map(([k, l]) => (
            <button key={k} className={`admin-tab${tab === k ? " is-active" : ""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === "menu"     && <MenuTab     onSuccess={showToast} onError={(m) => showToast(m, "err")} onConfirm={confirm_} onLog={log} />}
        {tab === "featured" && <FeaturedTab onSuccess={showToast} onError={(m) => showToast(m, "err")} onConfirm={confirm_} onLog={log} />}
        {tab === "history"  && <HistoryTab  history={history} onClear={() => { setHistory([]); lsSet("admin_history", []); }} />}
        {tab === "settings" && <SettingsTab onSuccess={showToast} onError={(m) => showToast(m, "err")} onConfirm={confirm_} onLog={log} />}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function AdminRoot() {
  const { adminToken, setAdminToken } = useUiStore();

  if (!adminToken) {
    return <LoginScreen onAuthed={(token) => setAdminToken(token)} />;
  }
  return <Dashboard />;
}

export default function Admin() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminRoot />
    </QueryClientProvider>
  );
}
