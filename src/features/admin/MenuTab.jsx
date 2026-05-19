// src/features/admin/MenuTab.jsx
// Menu items management with optimistic drag-and-drop reordering.

import { useState } from "react";
import {
  useMenu,
  useSections,
  useToggleComingSoon,
  useReorderMenu,
  usePizzaMutations,
} from "../../hooks/usePizzas.js";
import { DEFAULT_MENU } from "../../constants/defaults.js";
import ItemRow     from "../../components/admin/ItemRow.jsx";
import EditModal   from "../../components/admin/EditModal.jsx";
import SectionsModal from "../../components/admin/SectionsModal.jsx";
import * as api    from "../../services/api.js";

/**
 * @param {{ onSuccess: (msg: string) => void, onError: (msg: string) => void, onConfirm: (msg: string, cb: () => void) => void, onLog: (action: string) => void }} props
 */
export default function MenuTab({ onSuccess, onError, onConfirm, onLog }) {
  const { data: menuData, isLoading }     = useMenu();
  const { data: sectionsData }            = useSections();
  const toggleCS                          = useToggleComingSoon();
  const reorder                           = useReorderMenu();
  const { create, update, remove }        = usePizzaMutations();

  const menu     = menuData     || DEFAULT_MENU;
  const sections = (sectionsData || []).map((s) => ({ ...s, id: s.sectionId || s.id }));

  const [search,      setSearch]      = useState("");
  const [secFilter,   setSecFilter]   = useState("");
  const [dragId,      setDragId]      = useState(null);
  const [editing,     setEditing]     = useState(null); // { type, id, isNew, initialData }
  const [saving,      setSaving]      = useState(false);
  const [secModalOpen, setSecModalOpen] = useState(false);

  const displayItems = menu.filter((it) => {
    const matchSec    = !secFilter || (secFilter === "none" ? !it.menuSection : it.menuSection === secFilter);
    const matchSearch = !search || (it.label || "").includes(search) || (it.details || "").includes(search);
    return matchSec && matchSearch;
  });

  // ── Drag & Drop ──────────────────────────────────────────────────────────
  function onDragOver(e, overId) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    // Local reorder for instant visual feedback
    const a  = [...menu];
    const fi = a.findIndex((x) => (x.id || x._id) === dragId);
    const ti = a.findIndex((x) => (x.id || x._id) === overId);
    if (fi < 0 || ti < 0) return;
    const n = [...a];
    const [m] = n.splice(fi, 1);
    n.splice(ti, 0, m);
    reorder.mutate(n); // optimistic update
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────
  function openAdd() {
    setEditing({ type: "menu", id: null, isNew: true, initialData: null });
  }

  function openEdit(item) {
    setEditing({ type: "menu", id: item._id || item.id, isNew: false, initialData: item });
  }

  async function handleSave(payload, imgP, imgF) {
    setSaving(true);
    try {
      const data = { ...payload, imageUrl: imgP || "", flavorImageUrl: imgF || "" };
      if (editing.isNew) {
        await create.mutateAsync(data);
        onSuccess("✅ تم الإضافة");
        onLog(`إضافة: ${data.label}`);
      } else {
        await update.mutateAsync({ id: editing.id, ...data });
        onSuccess("✅ تم التعديل");
        onLog(`تعديل: ${data.label}`);
      }
      setEditing(null);
    } catch (e) {
      onError("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(item) {
    onConfirm(`حذف "${item.label}"؟`, async () => {
      try {
        await remove.mutateAsync(item.id || item._id);
        onSuccess("🗑 تم الحذف");
        onLog(`حذف: ${item.label}`);
      } catch (e) {
        onError("❌ " + e.message);
      }
    });
  }

  function handleToggleCS(item) {
    toggleCS.mutate({ id: item.id || item._id, comingSoon: !item.comingSoon });
    onLog(`${item.comingSoon ? "إظهار" : "إخفاء"}: ${item.label}`);
  }

  async function handleDuplicate(item) {
    try {
      await create.mutateAsync({ ...item, label: item.label + " — نسخة", id: undefined, _id: undefined });
      onSuccess("📋 تم النسخ");
      onLog(`نسخ: ${item.label}`);
    } catch (e) {
      onError("❌ " + e.message);
    }
  }

  function handleMove(item, dir) {
    const a   = [...menu];
    const idx = a.findIndex((x) => (x.id || x._id) === (item.id || item._id));
    const nxt = idx + dir;
    if (nxt < 0 || nxt >= a.length) return;
    const n = [...a];
    [n[idx], n[nxt]] = [n[nxt], n[idx]];
    reorder.mutate(n);
  }

  if (isLoading) return <div style={{ textAlign: "center", padding: "32px", color: "var(--gold-alpha-30)" }}><div className="spinner" style={{ width: 28, height: 28, margin: "0 auto 10px" }} /><p style={{ fontSize: ".75rem" }}>جاري التحميل...</p></div>;

  return (
    <>
      {secModalOpen && (
        <SectionsModal sections={sections} onClose={() => setSecModalOpen(false)} onSuccess={onSuccess} onError={onError} />
      )}

      {editing && (
        <EditModal editing={editing} sections={sections} onClose={() => setEditing(null)} onSave={handleSave} saving={saving} onError={onError} />
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10, alignItems: "center" }}>
        <button className="btn-icon" onClick={() => setSecModalOpen(true)} style={{ color: "var(--gold-dark)", fontSize: ".72rem" }}>📂 أقسام</button>
        <button className="btn-icon" onClick={openAdd} style={{ background: "#0d1a0d", border: "1px solid var(--green-alpha)", color: "var(--green)", fontSize: ".76rem" }}>+ إضافة صنف</button>
      </div>

      <input className="admin-input" style={{ marginBottom: 9 }} placeholder="🔍  ابحث..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* Section filter chips */}
      {sections.length > 0 && (
        <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
          <button className={`filter-chip${!secFilter ? " is-active" : ""}`} onClick={() => setSecFilter("")}>الكل ({menu.length})</button>
          {sections.map((s) => {
            const cnt = menu.filter((p) => p.menuSection === s.id).length;
            return <button key={s.id} className={`filter-chip${secFilter === s.id ? " is-active" : ""}`} onClick={() => setSecFilter(s.id)}>{s.emoji} {s.label} ({cnt})</button>;
          })}
          <button className={`filter-chip${secFilter === "none" ? " is-active" : ""}`} onClick={() => setSecFilter("none")}>بدون قسم ({menu.filter((p) => !p.menuSection).length})</button>
        </div>
      )}

      <p style={{ fontSize: ".57rem", color: "var(--text-disabled)", marginBottom: 7 }}>⠿ اسحب للترتيب · ▲▼ تحريك</p>

      {displayItems.length === 0 && <div style={{ textAlign: "center", padding: "26px", color: "var(--border-default)", fontSize: ".8rem" }}>لا توجد نتائج</div>}

      {displayItems.map((item) => {
        const iid = item._id || item.id;
        return (
          <ItemRow
            key={iid}
            item={item}
            type="menu"
            sections={sections}
            isDragging={dragId === iid}
            onDragStart={() => setDragId(iid)}
            onDragOver={(e) => onDragOver(e, iid)}
            onDragEnd={() => setDragId(null)}
            onEdit={() => openEdit(item)}
            onDuplicate={() => handleDuplicate(item)}
            onDelete={() => handleDelete(item)}
            onMoveUp={() => handleMove(item, -1)}
            onMoveDown={() => handleMove(item, +1)}
            onToggleCS={() => handleToggleCS(item)}
          />
        );
      })}
    </>
  );
}
