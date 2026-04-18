// pages/admin/pizza/[id].js
// id = "new" لإضافة بيتزا جديدة، أو MongoDB _id للتعديل

import { useState } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions }      from "../../api/auth/[...nextauth]";
import { connectDB }        from "@/lib/mongodb";
import Pizza                from "@/lib/models/Pizza";
import { useRouter }        from "next/router";
import Link                 from "next/link";

const EMPTY_FORM = {
  name:              "",
  category:          "menu",
  description:       "",
  details:           "",
  isActive:          true,
  comingSoon:        false,
  imageUrl:          "",
  fixedPriceOld:     "",
  fixedPriceNew:     "",
  fixedNumericPrice: "",
  sliceCount:        "",
  cols:              "",
  sortOrder:         0,
  // حجم نموذجي لبيتزا القائمة
  sizes: [
    { id: "sm", label: "صغير", priceOld: "", priceNew: "", numericPrice: "" },
    { id: "md", label: "وسط",  priceOld: "", priceNew: "", numericPrice: "" },
    { id: "lg", label: "كبير", priceOld: "", priceNew: "", numericPrice: "" },
  ],
  // حجمي خانم
  khanamSizes: [
    { id: "sm", label: "صغيرة", priceOld: "", priceNew: "", numericPrice: "" },
    { id: "lg", label: "كبيرة", priceOld: "", priceNew: "", numericPrice: "" },
  ],
};

export default function PizzaForm({ pizza: initialData, isNew }) {
  const router  = useRouter();
  const [form,  setForm]  = useState(initialData || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState(null); // { type: "ok"|"err", text }

  /* ── Helper: تعديل حقل عادي ── */
  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  /* ── Helper: تعديل حجم في مصفوفة ── */
  function updateSize(arrayKey, index, field, val) {
    setForm(prev => {
      const arr  = [...prev[arrayKey]];
      arr[index] = { ...arr[index], [field]: val };
      return { ...prev, [arrayKey]: arr };
    });
  }

  /* ── حفظ ── */
  async function handleSave() {
    setSaving(true);
    setMsg(null);

    // تنظيف البيانات قبل الإرسال
    const payload = {
      ...form,
      fixedNumericPrice: Number(form.fixedNumericPrice) || 0,
      sliceCount: Number(form.sliceCount) || 0,
      cols:       Number(form.cols)       || 0,
      sortOrder:  Number(form.sortOrder)  || 0,
      sizes: form.sizes.map(s => ({ ...s, numericPrice: Number(s.numericPrice) || 0 })),
      khanamSizes: form.khanamSizes.map(s => ({ ...s, numericPrice: Number(s.numericPrice) || 0 })),
    };

    const url    = isNew ? "/api/pizzas" : `/api/pizzas/${initialData._id}`;
    const method = isNew ? "POST" : "PUT";

    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      setMsg({ type: "ok", text: isNew ? "✓ تم إضافة البيتزا بنجاح!" : "✓ تم الحفظ بنجاح!" });
      if (isNew) setTimeout(() => router.push("/admin"), 1200);
    } else {
      setMsg({ type: "err", text: `✗ خطأ: ${data.error}` });
    }
    setSaving(false);
  }

  const isFeatured = form.category === "featured";
  const isKhanum   = form.name?.includes("خانم");

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Noto Kufi Arabic', sans-serif", color: "#E5D3B3", paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{ background: "#111", borderBottom: "1px solid #1e1e1e", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 20 }}>
        <Link href="/admin">
          <button style={{ background: "none", border: "none", color: "#C8A96A", cursor: "pointer", fontSize: "1.4rem", lineHeight: 1 }}>‹</button>
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: ".95rem", fontWeight: 700, color: "#E5D3B3" }}>
            {isNew ? "إضافة بيتزا جديدة" : `تعديل: ${form.name}`}
          </h1>
          <p style={{ fontSize: ".62rem", color: "#555" }}>بيتزا خانم — لوحة التحكم</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: "10px 22px", background: saving ? "#333" : "linear-gradient(135deg,#C8A96A,#8B6B4A)", backgroundSize: "200%", border: "none", borderRadius: 10, color: saving ? "#666" : "#0f0f0f", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: ".85rem", fontWeight: 700 }}>
          {saving ? "جارٍ الحفظ..." : "💾 حفظ"}
        </button>
      </div>

      {/* ── Alert ── */}
      {msg && (
        <div style={{ margin: "16px 24px 0", padding: "12px 16px", borderRadius: 12, fontSize: ".8rem", fontWeight: 600,
          background: msg.type === "ok" ? "#0d1a0d" : "#1a0d0d",
          border: `1px solid ${msg.type === "ok" ? "#4CAF5044" : "#ef444444"}`,
          color: msg.type === "ok" ? "#4CAF50" : "#ef4444",
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* ── Column 1: المعلومات الأساسية ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <Section title="المعلومات الأساسية">
            <Field label="اسم البيتزا *">
              <input style={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="مارغريتا" />
            </Field>

            <Field label="الفئة">
              <select style={inp} value={form.category} onChange={e => set("category", e.target.value)}>
                <option value="menu">قائمة البيتزا</option>
                <option value="featured">عرض مميز</option>
              </select>
            </Field>

            <Field label="وصف مختصر">
              <input style={inp} value={form.description} onChange={e => set("description", e.target.value)} placeholder="نبذة قصيرة تظهر على الكارد" />
            </Field>

            <Field label="المكونات التفصيلية">
              <textarea style={{ ...inp, resize: "vertical", minHeight: 80 }} value={form.details} onChange={e => set("details", e.target.value)} placeholder="جبنة القشقوان مع الصلصة الحمراء..." />
            </Field>

            <Field label="رابط الصورة">
              <input style={inp} value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} placeholder="https://..." />
            </Field>

            <Field label="ترتيب العرض">
              <input type="number" style={inp} value={form.sortOrder} onChange={e => set("sortOrder", e.target.value)} placeholder="0" />
            </Field>
          </Section>

          <Section title="الحالة">
            <div style={{ display: "flex", gap: 20 }}>
              <Toggle label="نشط" checked={form.isActive}    onChange={v => set("isActive", v)} />
              <Toggle label="قريباً" checked={form.comingSoon} onChange={v => set("comingSoon", v)} />
            </div>
          </Section>
        </div>

        {/* ── Column 2: الأسعار ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* العرض المميز: سعر ثابت + شرائح */}
          {isFeatured && !isKhanum && (
            <Section title="العرض المميز — سعر ثابت وشرائح">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <Field label="السعر القديم (ل.س)">
                  <input style={inp} value={form.fixedPriceOld} onChange={e => set("fixedPriceOld", e.target.value)} placeholder="150,000" />
                </Field>
                <Field label="السعر الجديد (ل.ج)">
                  <input style={inp} value={form.fixedPriceNew} onChange={e => set("fixedPriceNew", e.target.value)} placeholder="1,500" />
                </Field>
                <Field label="السعر الرقمي">
                  <input type="number" style={inp} value={form.fixedNumericPrice} onChange={e => set("fixedNumericPrice", e.target.value)} placeholder="150000" />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                <Field label="عدد الشرائح">
                  <input type="number" style={inp} value={form.sliceCount} onChange={e => set("sliceCount", e.target.value)} placeholder="8" />
                </Field>
                <Field label="الأعمدة (cols)">
                  <input type="number" style={inp} value={form.cols} onChange={e => set("cols", e.target.value)} placeholder="4" />
                </Field>
              </div>
            </Section>
          )}

          {/* بيتزا خانم: حجمين */}
          {isKhanum && (
            <Section title="أحجام بيتزا خانم">
              {form.khanamSizes.map((sz, i) => (
                <div key={sz.id} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: ".7rem", color: "#C8A96A88", marginBottom: 8 }}>{sz.label}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <Field label="القديم">
                      <input style={inp} value={sz.priceOld} onChange={e => updateSize("khanamSizes", i, "priceOld", e.target.value)} placeholder="45,000" />
                    </Field>
                    <Field label="الجديد">
                      <input style={inp} value={sz.priceNew} onChange={e => updateSize("khanamSizes", i, "priceNew", e.target.value)} placeholder="450" />
                    </Field>
                    <Field label="رقمي">
                      <input type="number" style={inp} value={sz.numericPrice} onChange={e => updateSize("khanamSizes", i, "numericPrice", e.target.value)} placeholder="45000" />
                    </Field>
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* بيتزا القائمة: 3 أحجام */}
          {!isFeatured && (
            <Section title="الأحجام والأسعار">
              {form.sizes.map((sz, i) => (
                <div key={sz.id} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: ".7rem", color: "#C8A96A88", marginBottom: 8 }}>{sz.label}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <Field label="السعر القديم">
                      <input style={inp} value={sz.priceOld} onChange={e => updateSize("sizes", i, "priceOld", e.target.value)} placeholder="35,000" />
                    </Field>
                    <Field label="السعر الجديد">
                      <input style={inp} value={sz.priceNew} onChange={e => updateSize("sizes", i, "priceNew", e.target.value)} placeholder="350" />
                    </Field>
                    <Field label="الرقم للحساب">
                      <input type="number" style={inp} value={sz.numericPrice} onChange={e => updateSize("sizes", i, "numericPrice", e.target.value)} placeholder="35000" />
                    </Field>
                  </div>
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── UI Sub-components ── */
function Section({ title, children }) {
  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, padding: "20px" }}>
      <p style={{ fontSize: ".68rem", color: "#C8A96A88", letterSpacing: "2px", marginBottom: 16 }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: ".65rem", color: "#555", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 11,
          background: checked ? "#C8A96A" : "#1e1e1e",
          border: "1px solid",
          borderColor: checked ? "#C8A96A" : "#2a2a2a",
          position: "relative", transition: "all .2s",
        }}
      >
        <div style={{
          position: "absolute", top: 2,
          right: checked ? 2 : 18,
          width: 16, height: 16, borderRadius: "50%",
          background: checked ? "#0f0f0f" : "#444",
          transition: "right .2s",
        }} />
      </div>
      <span style={{ fontSize: ".78rem", color: "#8B6B4A" }}>{label}</span>
    </label>
  );
}

const inp = {
  width: "100%", padding: "9px 12px",
  background: "#161616", border: "1px solid #252525",
  borderRadius: 10, color: "#E5D3B3",
  fontSize: ".82rem", fontFamily: "inherit", outline: "none",
};

/* ── Server Side ── */
export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  const { id } = ctx.params;

  // صفحة إضافة جديدة
  if (id === "new") {
    return { props: { pizza: null, isNew: true } };
  }

  // صفحة تعديل
  await connectDB();
  const pizza = await Pizza.findById(id).lean();
  if (!pizza) return { notFound: true };

  return {
    props: {
      pizza: JSON.parse(JSON.stringify(pizza)),
      isNew: false,
    },
  };
}
