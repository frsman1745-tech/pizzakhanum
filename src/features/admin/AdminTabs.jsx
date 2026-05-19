// src/features/admin/FeaturedTab.jsx

import { useState } from "react";
import { useFeatured, useSections, useReorderFeatured, useFeaturedMutations } from "../../hooks/usePizzas.js";
import { DEFAULT_FEATURED } from "../../constants/defaults.js";
import ItemRow   from "../../components/admin/ItemRow.jsx";
import EditModal from "../../components/admin/EditModal.jsx";

export function FeaturedTab({ onSuccess, onError, onConfirm, onLog }) {
  const { data: featuredData, isLoading } = useFeatured();
  const { data: sectionsData }            = useSections();
  const reorder                           = useReorderFeatured();
  const { create, update, remove }        = useFeaturedMutations();

  const featured = featuredData || DEFAULT_FEATURED;
  const sections = (sectionsData || []).map((s) => ({ ...s, id: s.sectionId || s.id }));

  const [search,  setSearch]  = useState("");
  const [dragId,  setDragId]  = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);

  const displayItems = featured.filter((it) => !search || (it.label || "").includes(search));

  function onDragOver(e, overId) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    const a  = [...featured];
    const fi = a.findIndex((x) => (x.id || x._id) === dragId);
    const ti = a.findIndex((x) => (x.id || x._id) === overId);
    if (fi < 0 || ti < 0) return;
    const n = [...a]; const [m] = n.splice(fi, 1); n.splice(ti, 0, m);
    reorder.mutate(n);
  }

  async function handleSave(payload, imgP, imgF) {
    setSaving(true);
    try {
      const data = { ...payload, imageUrl: imgP || "", flavorImageUrl: imgF || "" };
      if (editing.isNew) { await create.mutateAsync(data); onSuccess("✅ تم الإضافة"); onLog(`إضافة: ${data.label}`); }
      else               { await update.mutateAsync({ id: editing.id, ...data }); onSuccess("✅ تم التعديل"); onLog(`تعديل: ${data.label}`); }
      setEditing(null);
    } catch (e) { onError("❌ " + e.message); } finally { setSaving(false); }
  }

  function handleDelete(item) {
    onConfirm(`حذف "${item.label}"؟`, async () => {
      try { await remove.mutateAsync(item.id || item._id); onSuccess("🗑 تم الحذف"); onLog(`حذف: ${item.label}`); }
      catch (e) { onError("❌ " + e.message); }
    });
  }

  function handleMove(item, dir) {
    const a = [...featured]; const idx = a.findIndex((x) => (x.id || x._id) === (item.id || item._id));
    const n = [...a]; if (idx + dir < 0 || idx + dir >= n.length) return;
    [n[idx], n[idx + dir]] = [n[idx + dir], n[idx]];
    reorder.mutate(n);
  }

  if (isLoading) return <div style={{ textAlign: "center", padding: "32px", color: "var(--gold-alpha-30)" }}><div className="spinner" style={{ width: 28, height: 28, margin: "0 auto 10px" }} /></div>;

  return (
    <>
      {editing && <EditModal editing={editing} sections={sections} onClose={() => setEditing(null)} onSave={handleSave} saving={saving} onError={onError} />}
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
        <button className="btn-icon" onClick={() => setEditing({ type: "featured", id: null, isNew: true, initialData: null })} style={{ background: "#06111f", border: "1px solid var(--blue-alpha)", color: "var(--blue)", fontSize: ".76rem" }}>+ إضافة مميز</button>
      </div>
      <input className="admin-input" style={{ marginBottom: 9 }} placeholder="🔍  ابحث..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <p style={{ fontSize: ".57rem", color: "var(--text-disabled)", marginBottom: 7 }}>⠿ اسحب للترتيب · ▲▼ تحريك</p>
      {displayItems.length === 0 && <div style={{ textAlign: "center", padding: "26px", color: "var(--border-default)", fontSize: ".8rem" }}>لا توجد عروض مميزة</div>}
      {displayItems.map((item) => {
        const iid = item._id || item.id;
        return (
          <ItemRow key={iid} item={item} type="featured" sections={sections} isDragging={dragId === iid}
            onDragStart={() => setDragId(iid)} onDragOver={(e) => onDragOver(e, iid)} onDragEnd={() => setDragId(null)}
            onEdit={() => setEditing({ type: "featured", id: iid, isNew: false, initialData: item })}
            onDuplicate={async () => { try { await create.mutateAsync({ ...item, label: item.label + " — نسخة", id: undefined }); onSuccess("📋 تم النسخ"); } catch (e) { onError("❌ " + e.message); } }}
            onDelete={() => handleDelete(item)} onMoveUp={() => handleMove(item, -1)} onMoveDown={() => handleMove(item, +1)} />
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function HistoryTab({ history, onClear }) {
  return (
    <div style={{ background: "#141414", border: "1px solid var(--border-subtle)", borderRadius: 13, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
        <h2 style={{ fontSize: ".85rem", color: "var(--gold)" }}>📋 سجل التعديلات</h2>
        <button onClick={onClear} style={{ background: "none", border: "1px solid var(--border-subtle)", borderRadius: 7, color: "#2e2e2e", cursor: "pointer", padding: "3px 8px", fontSize: ".66rem", fontFamily: "var(--font)" }}>مسح</button>
      </div>
      {history.length === 0
        ? <p style={{ color: "var(--text-disabled)", fontSize: ".76rem", textAlign: "center", padding: "14px 0" }}>لا يوجد سجل</p>
        : history.map((h, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: ".7rem", color: "var(--gold-dark)" }}>
            <span>{h.a}</span><span style={{ color: "var(--text-disabled)", flexShrink: 0 }}>{h.t}</span>
          </div>
        ))
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function SettingsTab({ onSuccess, onConfirm, onLog, onError }) {
  const [siteName, setSiteName] = useState(() => localStorage.getItem("site_name")    || "بيتزا خانم");
  const [slogan,   setSlogan]   = useState(() => localStorage.getItem("site_slogan")  || "كُل لتعيش · وعِش لأجل البيتزا");
  const [wapp,     setWapp]     = useState(() => localStorage.getItem("site_whatsapp")|| "963998950904");
  // NOTE: In a full production build, these settings should be persisted to the
  // database (a /api/settings endpoint) rather than localStorage, so they
  // survive across devices. For now we preserve the existing behavior.

  function save() {
    localStorage.setItem("site_name",      siteName);
    localStorage.setItem("site_slogan",    slogan);
    localStorage.setItem("site_whatsapp",  wapp);
    onLog("تعديل الإعدادات");
    onSuccess("⚙️ تم حفظ الإعدادات");
  }

  return (
    <div style={{ background: "#141414", border: "1px solid var(--border-subtle)", borderRadius: 13, padding: 18 }}>
      <h2 style={{ fontSize: ".85rem", color: "var(--gold)", marginBottom: 14 }}>⚙️ إعدادات الموقع</h2>
      {[["اسم المطعم", siteName, setSiteName, false], ["الشعار", slogan, setSlogan, false], ["رقم واتساب", wapp, setWapp, true]].map(([l, v, s, ltr]) => (
        <div key={l} style={{ marginBottom: 11 }}>
          <span className="section-label" style={{ marginTop: 0 }}>{l}</span>
          <input className="admin-input" value={v} onChange={(e) => s(e.target.value)} dir={ltr ? "ltr" : "rtl"} />
        </div>
      ))}
      <button className="btn-primary" style={{ width: "100%", marginTop: 6 }} onClick={save}>💾 حفظ الإعدادات</button>
    </div>
  );
}
