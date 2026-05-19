// src/components/admin/SectionsModal.jsx

import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import { useSectionsMutation } from "../../hooks/usePizzas.js";

const uid = () => Math.random().toString(36).slice(2, 8);

/**
 * @param {{ sections: any[], onClose: () => void, onSuccess: (msg: string) => void, onError: (msg: string) => void }} props
 */
export default function SectionsModal({ sections, onClose, onSuccess, onError }) {
  const [form, setForm] = useState(() => sections.map((s) => ({ ...s })));
  const mutation = useSectionsMutation();

  function addSec()          { setForm((p) => [...p, { id: uid(), label: "قسم جديد", emoji: "🍕", sortOrder: p.length }]); }
  function removeSec(id)     { setForm((p) => p.filter((s) => s.id !== id)); }
  function updateSec(id, k, v) { setForm((p) => p.map((s) => s.id === id ? { ...s, [k]: v } : s)); }
  function moveSec(id, dir) {
    setForm((p) => {
      const a = [...p];
      const i = a.findIndex((s) => s.id === id);
      const t = i + dir;
      if (t < 0 || t >= a.length) return p;
      [a[i], a[t]] = [a[t], a[i]];
      return a;
    });
  }

  async function save() {
    try {
      await mutation.mutateAsync(form.map((s, i) => ({ ...s, sortOrder: i })));
      onSuccess("✅ تم حفظ الأقسام");
      onClose();
    } catch (e) {
      onError("❌ " + e.message);
    }
  }

  return (
    <Modal onClose={() => { if (!mutation.isPending) onClose(); }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "var(--gold)", fontSize: ".93rem" }}>📂 إدارة أقسام القائمة</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "1.3rem" }}>×</button>
      </div>
      <p style={{ fontSize: ".66rem", color: "#555", marginBottom: 13, lineHeight: 1.6 }}>
        كل قسم يظهر كتبويب في صفحة القائمة. الزبون يتصفح أفقياً ويتغير العنوان تلقائياً عند التمرير.
      </p>

      {form.map((s, si) => (
        <div key={s.id} style={{ background: "#141414", border: "1px solid var(--border-subtle)", borderRadius: 11, padding: "11px 12px", marginBottom: 7, display: "flex", alignItems: "center", gap: 10 }}>
          <span className="drag-handle">⠿</span>
          <input className="admin-input sm" style={{ width: 46 }} value={s.emoji} onChange={(e) => updateSec(s.id, "emoji", e.target.value)} placeholder="🍕" />
          <input className="admin-input sm" style={{ flex: 1 }} value={s.label} onChange={(e) => updateSec(s.id, "label", e.target.value)} placeholder="اسم القسم" />
          <div style={{ display: "flex", gap: 3 }}>
            <button className="btn-icon" style={{ padding: "3px 6px", fontSize: ".6rem" }} onClick={() => moveSec(s.id, -1)} disabled={si === 0}>▲</button>
            <button className="btn-icon" style={{ padding: "3px 6px", fontSize: ".6rem" }} onClick={() => moveSec(s.id, +1)} disabled={si === form.length - 1}>▼</button>
            <button className="btn-icon" style={{ background: "#1a0808", border: "1px solid var(--red-alpha)", color: "var(--red)", padding: "3px 6px" }} onClick={() => removeSec(s.id)}>🗑</button>
          </div>
        </div>
      ))}

      <button onClick={addSec} style={{ width: "100%", padding: "8px", background: "#111", border: "1px dashed var(--border-default)", borderRadius: 9, color: "#2a2a2a", cursor: "pointer", fontFamily: "var(--font)", fontSize: ".72rem", marginTop: 4, marginBottom: 16 }}>
        + إضافة قسم جديد
      </button>

      <div style={{ display: "flex", gap: 9 }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={save} disabled={mutation.isPending}>
          {mutation.isPending ? "جاري الحفظ..." : "💾 حفظ الأقسام"}
        </button>
        <button className="btn-ghost" onClick={onClose}>إلغاء</button>
      </div>
    </Modal>
  );
}
