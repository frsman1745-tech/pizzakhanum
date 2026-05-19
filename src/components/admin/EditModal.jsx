// src/components/admin/EditModal.jsx
// Full item edit form. Previously monolithically embedded inside Admin.jsx's
// render function, making Admin.jsx 800+ lines long.

import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import ImgUploader from "./ImgUploader.jsx";

const uid = () => Math.random().toString(36).slice(2, 8);

function sl(text) {
  return (
    <span className="section-label">{text}</span>
  );
}

/* ── Sizes Block ────────────────────────────────────────────────────────── */
function SizesBlock({ form, setForm, stateKey = "_sizes", title = "📏 الأحجام والأسعار", placeholder = "صغير / وسط / كبير" }) {
  function addSize() {
    const s = { id: uid(), label: "حجم جديد", priceOld: "0", priceNew: "0", numericPrice: 0, sortOrder: (form[stateKey] || []).length };
    setForm((p) => ({ ...p, [stateKey]: [...(p[stateKey] || []), s] }));
  }
  function removeSize(sid) { setForm((p) => ({ ...p, [stateKey]: (p[stateKey] || []).filter((s) => s.id !== sid) })); }
  function updateSize(sid, fkey, val) {
    setForm((p) => ({
      ...p,
      [stateKey]: (p[stateKey] || []).map((s) => {
        if (s.id !== sid) return s;
        const u = { ...s, [fkey]: val };
        if (fkey === "priceOld") u.numericPrice = Number(String(val).replace(/,/g, "")) || 0;
        return u;
      }),
    }));
  }
  function moveSize(sid, dir) {
    setForm((p) => {
      const a = [...(p[stateKey] || [])];
      const i = a.findIndex((s) => s.id === sid);
      const t = i + dir;
      if (t < 0 || t >= a.length) return p;
      [a[i], a[t]] = [a[t], a[i]];
      return { ...p, [stateKey]: a };
    });
  }

  return (
    <div style={{ marginTop: 14, background: "#0f0f0f", border: "1px solid var(--border-subtle)", borderRadius: 13, padding: 13 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--gold)" }}>{title}</span>
        <button className="btn-icon" style={{ color: "var(--green)", borderColor: "var(--green-alpha)", background: "#0d1a0d", fontSize: ".72rem" }} onClick={addSize}>+ إضافة حجم</button>
      </div>
      {!(form[stateKey] || []).length && <p style={{ fontSize: ".68rem", color: "var(--text-disabled)", textAlign: "center", padding: "7px 0" }}>لا توجد أحجام</p>}
      {(form[stateKey] || []).map((sz, si) => (
        <div key={sz.id} style={{ background: "#141414", border: "1px solid var(--border-default)", borderRadius: 10, padding: "9px 10px", marginBottom: 7 }}>
          <div style={{ display: "flex", gap: 7, marginBottom: 7, alignItems: "center" }}>
            <span className="drag-handle">⠿</span>
            <input className="admin-input sm" style={{ flex: 1 }} value={sz.label} onChange={(e) => updateSize(sz.id, "label", e.target.value)} placeholder={placeholder} />
            <div style={{ display: "flex", gap: 3 }}>
              <button className="btn-icon" style={{ padding: "3px 6px", fontSize: ".6rem" }} onClick={() => moveSize(sz.id, -1)} disabled={si === 0}>▲</button>
              <button className="btn-icon" style={{ padding: "3px 6px", fontSize: ".6rem" }} onClick={() => moveSize(sz.id, +1)} disabled={si === (form[stateKey] || []).length - 1}>▼</button>
              <button className="btn-icon" style={{ background: "#1a0808", border: "1px solid var(--red-alpha)", color: "var(--red)", padding: "3px 6px" }} onClick={() => removeSize(sz.id)}>🗑</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><p style={{ fontSize: ".58rem", color: "#333", marginBottom: 3 }}>السعر ل.س</p><input className="admin-input sm" value={sz.priceOld} onChange={(e) => updateSize(sz.id, "priceOld", e.target.value)} placeholder="35,000" /></div>
            <div><p style={{ fontSize: ".58rem", color: "#333", marginBottom: 3 }}>السعر ل.ج</p><input className="admin-input sm" value={sz.priceNew} onChange={(e) => updateSize(sz.id, "priceNew", e.target.value)} placeholder="350" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Extras Block ───────────────────────────────────────────────────────── */
function ExtrasBlock({ form, setForm }) {
  function addGroup() {
    const g = { id: uid(), name: "مجموعة جديدة", type: "single", required: false, sortOrder: (form.extras || []).length, options: [] };
    setForm((p) => ({ ...p, extras: [...(p.extras || []), g] }));
  }
  function removeGroup(gid) { setForm((p) => ({ ...p, extras: (p.extras || []).filter((g) => g.id !== gid) })); }
  function updateGroup(gid, key, val) { setForm((p) => ({ ...p, extras: (p.extras || []).map((g) => g.id === gid ? { ...g, [key]: val } : g) })); }
  function moveGroup(gid, dir) {
    setForm((p) => {
      const a = [...(p.extras || [])];
      const i = a.findIndex((g) => g.id === gid);
      const t = i + dir;
      if (t < 0 || t >= a.length) return p;
      [a[i], a[t]] = [a[t], a[i]];
      return { ...p, extras: a };
    });
  }
  function addOption(gid) {
    const o = { id: uid(), label: "خيار جديد", priceOld: "0", priceNew: "0", numericPrice: 0, sortOrder: 0 };
    setForm((p) => ({ ...p, extras: (p.extras || []).map((g) => g.id === gid ? { ...g, options: [...(g.options || []), o] } : g) }));
  }
  function removeOption(gid, oid) { setForm((p) => ({ ...p, extras: (p.extras || []).map((g) => g.id === gid ? { ...g, options: (g.options || []).filter((o) => o.id !== oid) } : g) })); }
  function updateOption(gid, oid, key, val) {
    setForm((p) => ({
      ...p,
      extras: (p.extras || []).map((g) => g.id === gid ? {
        ...g,
        options: (g.options || []).map((o) => {
          if (o.id !== oid) return o;
          const u = { ...o, [key]: val };
          if (key === "priceOld") u.numericPrice = Number(String(val).replace(/,/g, "")) || 0;
          return u;
        }),
      } : g),
    }));
  }

  return (
    <div style={{ marginTop: 12, background: "#0f0f0f", border: "1px solid var(--border-subtle)", borderRadius: 13, padding: 13 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--gold)" }}>🧩 مجموعات الإضافات</span>
        <button className="btn-icon" style={{ color: "var(--blue)", borderColor: "var(--blue-alpha)", background: "#06111f", fontSize: ".72rem" }} onClick={addGroup}>+ إضافة مجموعة</button>
      </div>
      {!(form.extras || []).length && <p style={{ fontSize: ".68rem", color: "var(--text-disabled)", textAlign: "center", padding: "7px 0" }}>لا توجد مجموعات</p>}
      {(form.extras || []).map((g, gi) => (
        <div key={g.id} style={{ background: "#111", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: 13, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span className="drag-handle">⠿</span>
            <input className="admin-input sm" style={{ flex: 1 }} value={g.name} onChange={(e) => updateGroup(g.id, "name", e.target.value)} placeholder="اسم المجموعة" />
            <select className="admin-input sm" style={{ width: 110 }} value={g.type} onChange={(e) => updateGroup(g.id, "type", e.target.value)}>
              <option value="single">اختيار واحد</option>
              <option value="multi">متعدد</option>
            </select>
            <div style={{ display: "flex", gap: 3 }}>
              <button className="btn-icon" style={{ padding: "3px 6px", fontSize: ".6rem" }} onClick={() => moveGroup(g.id, -1)} disabled={gi === 0}>▲</button>
              <button className="btn-icon" style={{ padding: "3px 6px", fontSize: ".6rem" }} onClick={() => moveGroup(g.id, +1)} disabled={gi === (form.extras || []).length - 1}>▼</button>
              <button className="btn-icon" style={{ background: "#1a0808", border: "1px solid var(--red-alpha)", color: "var(--red)", padding: "3px 6px" }} onClick={() => removeGroup(g.id)}>🗑</button>
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: ".68rem", color: "#555", cursor: "pointer", marginBottom: 8 }}>
            <input type="checkbox" checked={g.required || false} onChange={(e) => updateGroup(g.id, "required", e.target.checked)} style={{ accentColor: "var(--gold)" }} />
            إلزامي
          </label>
          {(g.options || []).map((opt, oi) => (
            <div key={opt.id} style={{ display: "flex", alignItems: "center", gap: 7, background: "#161616", border: "1px solid var(--border-default)", borderRadius: 9, padding: "7px 9px", marginBottom: 6 }}>
              <span className="drag-handle" style={{ fontSize: ".7rem" }}>⠿</span>
              <input className="admin-input sm" style={{ flex: 1, minWidth: 0 }} value={opt.label} onChange={(e) => updateOption(g.id, opt.id, "label", e.target.value)} placeholder="اسم الخيار" />
              <input className="admin-input sm" style={{ width: 80 }} value={opt.priceOld} onChange={(e) => updateOption(g.id, opt.id, "priceOld", e.target.value)} placeholder="ل.س" />
              <input className="admin-input sm" style={{ width: 65 }} value={opt.priceNew} onChange={(e) => updateOption(g.id, opt.id, "priceNew", e.target.value)} placeholder="ل.ج" />
              <button className="btn-icon" style={{ background: "#1a0808", border: "1px solid var(--red-alpha)", color: "var(--red)", padding: "3px 6px" }} onClick={() => removeOption(g.id, opt.id)}>🗑</button>
            </div>
          ))}
          <button onClick={() => addOption(g.id)} style={{ width: "100%", marginTop: 6, padding: "6px", background: "#111", border: "1px dashed var(--border-default)", borderRadius: 8, color: "#2a2a2a", cursor: "pointer", fontFamily: "var(--font)", fontSize: ".68rem" }}>+ إضافة خيار</button>
        </div>
      ))}
    </div>
  );
}

/* ══ EditModal ══════════════════════════════════════════════════════════════ */
/**
 * @param {{
 *   editing: { type: "menu"|"featured", id: string|null, isNew: boolean } | null,
 *   sections: any[],
 *   onClose: () => void,
 *   onSave: (payload: any, imgP: string|null, imgF: string|null) => Promise<void>,
 *   saving: boolean,
 *   onError: (msg: string) => void,
 * }} props
 */
export default function EditModal({ editing, sections, onClose, onSave, saving, onError }) {
  const isFeat = editing?.type === "featured";

  const [form, setForm] = useState(() => {
    if (!editing?.initialData) return { label: "", details: "", desc: "", comingSoon: false, menuSection: "", _sizes: [], extras: [], sliceCount: 0, cols: 0, _khanamSizes: [], priceOld: "", priceNew: "", numericPrice: 0 };
    const d = editing.initialData;
    return {
      ...d,
      _sizes: (d.sizes || []).map((s) => ({ ...s })),
      _khanamSizes: (d.khanamSizes || d.sizes || []).map((s) => ({ ...s })),
      extras: (d.extras || []).map((g) => ({ ...g, options: (g.options || []).map((o) => ({ ...o })) })),
    };
  });

  const [imgP, setImgP] = useState(editing?.initialData?.imageUrl || null);
  const [imgF, setImgF] = useState(editing?.initialData?.flavorImageUrl || null);
  const [uploadingP, setUploadingP] = useState(false);
  const [uploadingF, setUploadingF] = useState(false);

  if (!editing) return null;

  async function handleSave() {
    if (!form.label?.trim()) { onError("⚠ الاسم مطلوب"); return; }
    const payload = {
      label:          form.label,
      menuSection:    form.menuSection || "",
      details:        form.details || "",
      desc:           form.desc || "",
      comingSoon:     form.comingSoon ?? false,
      priceOld:       form.priceOld || "",
      priceNew:       form.priceNew || "",
      numericPrice:   form.numericPrice || 0,
      sizes:          (form._sizes || []).map((s, i) => ({ ...s, sortOrder: i })),
      khanamSizes:    (form._khanamSizes || []).map((s, i) => ({ ...s, sortOrder: i })),
      extras:         (form.extras || []).map((g, i) => ({ ...g, sortOrder: i, options: (g.options || []).map((o, j) => ({ ...o, sortOrder: j })) })),
      sliceCount:     Number(form.sliceCount) || 0,
      cols:           Number(form.cols) || 0,
      sortOrder:      form.sortOrder || 0,
    };
    await onSave(payload, imgP, imgF);
  }

  return (
    <Modal onClose={() => { if (!saving) onClose(); }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "var(--gold)", fontSize: ".93rem" }}>
          {editing.isNew ? (isFeat ? "✨ إضافة عرض مميز" : "✨ إضافة صنف") : `✏️ ${form.label || "تعديل"}`}
        </h2>
        <button onClick={() => { if (!saving) onClose(); }} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "1.3rem", lineHeight: 1 }}>×</button>
      </div>

      {/* Images */}
      {sl("الصور")}
      <div style={{ display: "grid", gridTemplateColumns: editing.type === "menu" ? "1fr 1fr" : "1fr", gap: 10, marginTop: 6 }}>
        <ImgUploader label="📷 صورة الكارد" imageUrl={imgP} onUploaded={setImgP} onRemove={() => setImgP(null)} uploading={uploadingP} setUploading={setUploadingP} onError={onError} uploadType="card" />
        {editing.type === "menu" && (
          <ImgUploader label="🎨 صورة النكهة" imageUrl={imgF} onUploaded={setImgF} onRemove={() => setImgF(null)} uploading={uploadingF} setUploading={setUploadingF} onError={onError} uploadType="flavor" />
        )}
      </div>

      {/* Name */}
      {sl("الاسم *")}
      <input className="admin-input" value={form.label || ""} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder={isFeat ? "بيتزا المتر" : "مارغريتا"} />

      {/* Menu-specific fields */}
      {!isFeat && (<>
        {sl("القسم")}
        <select className="admin-input" value={form.menuSection || ""} onChange={(e) => setForm((p) => ({ ...p, menuSection: e.target.value }))}>
          <option value="">بدون قسم</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
        </select>

        {sl("المكونات")}
        <textarea className="admin-input" rows={3} value={form.details || ""} onChange={(e) => setForm((p) => ({ ...p, details: e.target.value }))} placeholder="جبنة القشقوان مع الصلصة الحمراء..." />

        {sl("الحالة")}
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <button className={`status-pill${!form.comingSoon ? " is-visible" : ""}`} onClick={() => setForm((p) => ({ ...p, comingSoon: false }))}>✅ ظاهر</button>
          <button className={`status-pill${form.comingSoon ? " is-hidden" : ""}`} onClick={() => setForm((p) => ({ ...p, comingSoon: true }))}>⏳ قريباً</button>
        </div>

        <SizesBlock form={form} setForm={setForm} stateKey="_sizes" title="📏 الأحجام والأسعار" />
        <ExtrasBlock form={form} setForm={setForm} />
      </>)}

      {/* Featured-specific fields */}
      {isFeat && (<>
        {sl("الوصف القصير")}
        <textarea className="admin-input" rows={3} value={form.desc || ""} onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))} placeholder="متر كامل من النكهات المتنوعة..." />

        {sl("نوع العرض المميز")}
        <div style={{ display: "flex", gap: 7, marginTop: 6, flexWrap: "wrap" }}>
          {[
            { v: "fixed",   l: "💲 ثمن ثابت",     active: !form.sliceCount && !(form._khanamSizes || []).length },
            { v: "builder", l: "🍕 Builder (شرائح)", active: form.sliceCount > 0 },
            { v: "khanum",  l: "👑 بيتزا خانم",    active: (form._khanamSizes || []).length > 0 },
          ].map((o) => (
            <button key={o.v} className={`filter-chip${o.active ? " is-active" : ""}`} onClick={() => {
              if (o.v === "fixed")   setForm((p) => ({ ...p, sliceCount: 0, cols: 0, _khanamSizes: [] }));
              if (o.v === "builder") setForm((p) => ({ ...p, sliceCount: p.sliceCount || 8, cols: p.cols || 4, _khanamSizes: [] }));
              if (o.v === "khanum")  setForm((p) => ({ ...p, sliceCount: 0, cols: 0 }));
            }}>{o.l}</button>
          ))}
        </div>

        {/* Fixed price */}
        {!form.sliceCount && !(form._khanamSizes || []).length && (<>
          {sl("الأسعار")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
            {[["priceOld", "السعر ل.س", "150,000"], ["priceNew", "السعر ل.ج", "1,500"]].map(([k, l, ph]) => (
              <div key={k}><p style={{ fontSize: ".6rem", color: "#333", marginBottom: 3 }}>{l}</p><input className="admin-input sm" value={form[k] || ""} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))} placeholder={ph} /></div>
            ))}
          </div>
        </>)}

        {/* Builder */}
        {form.sliceCount > 0 && (<>
          {sl("إعداد الشبكة")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
            <div>
              <p style={{ fontSize: ".6rem", color: "#333", marginBottom: 3 }}>عدد الشرائح الكلي</p>
              <input className="admin-input sm" type="number" min={1} max={24} value={form.sliceCount || 8} onChange={(e) => setForm((p) => ({ ...p, sliceCount: Number(e.target.value) }))} />
            </div>
            <div>
              <p style={{ fontSize: ".6rem", color: "#333", marginBottom: 3 }}>عدد الأعمدة</p>
              <input className="admin-input sm" type="number" min={1} max={8} value={form.cols || 4} onChange={(e) => setForm((p) => ({ ...p, cols: Number(e.target.value) }))} />
            </div>
          </div>
          {/* Grid preview */}
          <div style={{ marginTop: 10, background: "#0f0f0f", borderRadius: 10, padding: 10, border: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: ".57rem", color: "var(--text-disabled)", marginBottom: 7, letterSpacing: "2px" }}>معاينة الشبكة</p>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(form.cols || 4, 8)}, 1fr)`, gap: 4 }}>
              {Array.from({ length: Math.min(form.sliceCount || 8, 24) }, (_, i) => (
                <div key={i} style={{ background: "linear-gradient(135deg,#1c0e05,#120a02)", border: "1px solid #222", borderRadius: 5, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: ".48rem", color: "#333" }}>{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            {[["priceOld", "السعر ل.س", "150,000"], ["priceNew", "السعر ل.ج", "1,500"]].map(([k, l, ph]) => (
              <div key={k}><p style={{ fontSize: ".6rem", color: "#333", marginBottom: 3 }}>{l}</p><input className="admin-input sm" value={form[k] || ""} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))} placeholder={ph} /></div>
            ))}
          </div>
        </>)}

        {/* Khanum sizes */}
        {(form._khanamSizes || []).length > 0 && (
          <SizesBlock form={form} setForm={setForm} stateKey="_khanamSizes" title="👑 أحجام بيتزا خانم" placeholder="صغيرة / كبيرة" />
        )}
        {!(form._khanamSizes || []).length && !form.sliceCount && (
          <button onClick={() => {
            const s = { id: uid(), label: "حجم جديد", priceOld: "0", priceNew: "0", numericPrice: 0, sortOrder: 0 };
            setForm((p) => ({ ...p, _khanamSizes: [...(p._khanamSizes || []), s] }));
          }} style={{ marginTop: 8, width: "100%", padding: "7px", background: "#111", border: "1px dashed var(--border-default)", borderRadius: 9, color: "#2a2a2a", cursor: "pointer", fontFamily: "var(--font)", fontSize: ".7rem" }}>+ إضافة أحجام خانم</button>
        )}

        <ExtrasBlock form={form} setForm={setForm} />
      </>)}

      {/* Live Preview */}
      <div style={{ background: "#0f0f0f", border: "1px solid var(--border-subtle)", borderRadius: 11, padding: 12, marginTop: 14, overflow: "hidden" }}>
        <p style={{ fontSize: ".55rem", color: "var(--text-disabled)", marginBottom: 7, letterSpacing: "2px" }}>معاينة مباشرة</p>
        {imgP && <img src={imgP} alt="" style={{ width: "100%", height: 84, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />}
        <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: ".85rem", marginBottom: 3 }}>{form.label || "—"}</p>
        <p style={{ fontSize: ".67rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{form.details || form.desc || "—"}</p>
        {(form.priceOld || form.priceNew) && <p style={{ fontSize: ".72rem", color: "var(--gold)", marginTop: 4, fontWeight: 700 }}>{form.priceOld} ل.س {form.priceNew && `/ ${form.priceNew} ل.ج`}</p>}
        {(form._sizes || []).length > 0 && <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>{(form._sizes || []).map((s) => <span key={s.id} style={{ fontSize: ".52rem", background: "var(--gold-alpha-10)", color: "var(--gold)", border: "1px solid var(--gold-alpha-10)", borderRadius: 5, padding: "1px 6px" }}>{s.label} {s.priceOld && `— ${s.priceOld}`}</span>)}</div>}
      </div>

      {/* Footer actions */}
      <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
        <button className="btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }} onClick={handleSave} disabled={saving || uploadingP || uploadingF}>
          {saving
            ? <><div className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> جاري الحفظ...</>
            : "💾 حفظ"
          }
        </button>
        <button className="btn-ghost" onClick={() => { if (!saving) onClose(); }}>إلغاء</button>
      </div>
    </Modal>
  );
}
