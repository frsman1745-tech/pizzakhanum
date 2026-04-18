// pages/admin/index.js
import { useState } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions }      from "../api/auth/[...nextauth]";
import { connectDB }        from "@/lib/mongodb";
import Pizza                from "@/lib/models/Pizza";
import { signOut }          from "next-auth/react";
import Link                 from "next/link";
import { useRouter }        from "next/router";

export default function AdminDashboard({ pizzas: initialPizzas }) {
  const router = useRouter();
  const [pizzas,  setPizzas]  = useState(initialPizzas);
  const [loading, setLoading] = useState(null);  // id of pizza being toggled
  const [search,  setSearch]  = useState("");
  const [tab,     setTab]     = useState("all"); // all | menu | featured

  /* ── فلترة ── */
  const filtered = pizzas.filter(p => {
    const matchTab    = tab === "all" || p.category === tab;
    const matchSearch = p.name.includes(search) || p.description?.includes(search);
    return matchTab && matchSearch;
  });

  /* ── تبديل isActive ── */
  async function toggleActive(pizza) {
    setLoading(pizza._id);
    const res = await fetch(`/api/pizzas/${pizza._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !pizza.isActive }),
    });
    const data = await res.json();
    if (data.success) {
      setPizzas(prev => prev.map(p => p._id === pizza._id ? data.data : p));
    }
    setLoading(null);
  }

  /* ── حذف ── */
  async function handleDelete(id) {
    if (!confirm("هل أنت متأكد من حذف هذه البيتزا؟")) return;
    const res  = await fetch(`/api/pizzas/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setPizzas(prev => prev.filter(p => p._id !== id));
    }
  }

  const TAB_LABELS = { all: "الكل", menu: "قائمة البيتزا", featured: "العروض المميزة" };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Noto Kufi Arabic', sans-serif", color: "#E5D3B3" }}>

      {/* ── Header ── */}
      <div style={{ background: "#111", borderBottom: "1px solid #1e1e1e", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.4rem" }}>🍕</span>
          <div>
            <h1 style={{ fontSize: ".95rem", fontWeight: 700, color: "#C8A96A" }}>بيتزا خانم</h1>
            <p style={{ fontSize: ".62rem", color: "#555" }}>لوحة التحكم</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/admin/pizza/new">
            <button style={btnStyle("#C8A96A", "#0f0f0f")}>+ إضافة بيتزا</button>
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/admin/login" })} style={btnStyle("#1e1e1e", "#666")}>
            خروج
          </button>
        </div>
      </div>

      <div style={{ padding: "24px" }}>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "إجمالي البيتزا",  value: pizzas.length,                           color: "#C8A96A" },
            { label: "نشطة",            value: pizzas.filter(p => p.isActive).length,   color: "#4CAF50" },
            { label: "مخفية",           value: pizzas.filter(p => !p.isActive).length,  color: "#ef4444" },
          ].map(s => (
            <div key={s.label} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 14, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: ".68rem", color: "#555", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Search + Tabs ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            placeholder="ابحث عن بيتزا..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: "9px 14px", background: "#141414", border: "1px solid #252525", borderRadius: 10, color: "#E5D3B3", fontFamily: "inherit", fontSize: ".84rem", outline: "none" }}
          />
          {Object.entries(TAB_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid", cursor: "pointer", fontFamily: "inherit", fontSize: ".78rem", transition: "all .2s",
                background: tab === key ? "#C8A96A" : "#141414",
                borderColor: tab === key ? "#C8A96A" : "#252525",
                color: tab === key ? "#0f0f0f" : "#666",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Pizza Table ── */}
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 90px 80px 120px", gap: 0, background: "#0d0d0d", padding: "12px 18px", borderBottom: "1px solid #1a1a1a" }}>
            {["اسم البيتزا", "الفئة", "الحالة", "قريباً", "إجراءات"].map(h => (
              <span key={h} style={{ fontSize: ".65rem", color: "#555", fontWeight: 600, letterSpacing: "1px" }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#333", fontSize: ".85rem" }}>
              لا توجد نتائج
            </div>
          ) : (
            filtered.map((pizza, i) => (
              <div key={pizza._id}
                style={{ display: "grid", gridTemplateColumns: "1fr 100px 90px 80px 120px", gap: 0, padding: "14px 18px", borderBottom: i < filtered.length - 1 ? "1px solid #141414" : "none", alignItems: "center", transition: "background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#141414"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Name */}
                <div>
                  <p style={{ fontWeight: 600, fontSize: ".85rem", color: "#E5D3B3", marginBottom: 2 }}>{pizza.name}</p>
                  <p style={{ fontSize: ".62rem", color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                    {pizza.details || pizza.description || "—"}
                  </p>
                </div>

                {/* Category */}
                <span style={{ fontSize: ".68rem", padding: "3px 10px", borderRadius: 20, background: pizza.category === "featured" ? "#C8A96A22" : "#1a1a2a", color: pizza.category === "featured" ? "#C8A96A" : "#4DA6FF", width: "fit-content" }}>
                  {pizza.category === "featured" ? "مميز" : "قائمة"}
                </span>

                {/* Toggle Active */}
                <div>
                  <button
                    onClick={() => toggleActive(pizza)}
                    disabled={loading === pizza._id}
                    style={{
                      padding: "5px 12px", borderRadius: 20, border: "1px solid", cursor: "pointer",
                      fontFamily: "inherit", fontSize: ".65rem", fontWeight: 600, transition: "all .2s",
                      background: pizza.isActive ? "#0d1a0d" : "#1a0d0d",
                      borderColor: pizza.isActive ? "#4CAF5066" : "#ef444466",
                      color: pizza.isActive ? "#4CAF50" : "#ef4444",
                      opacity: loading === pizza._id ? .5 : 1,
                    }}
                  >
                    {loading === pizza._id ? "..." : pizza.isActive ? "✓ نشط" : "✗ مخفي"}
                  </button>
                </div>

                {/* Coming Soon */}
                <span style={{ fontSize: ".7rem", color: pizza.comingSoon ? "#C8A96A" : "#333" }}>
                  {pizza.comingSoon ? "قريباً ✓" : "—"}
                </span>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <Link href={`/admin/pizza/${pizza._id}`}>
                    <button style={{ padding: "5px 11px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, color: "#C8A96A", cursor: "pointer", fontSize: ".65rem", fontFamily: "inherit" }}>
                      ✏️ تعديل
                    </button>
                  </Link>
                  <button onClick={() => handleDelete(pizza._id)}
                    style={{ padding: "5px 11px", background: "#1a0d0d", border: "1px solid #2a1515", borderRadius: 8, color: "#ef4444", cursor: "pointer", fontSize: ".65rem", fontFamily: "inherit" }}>
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function btnStyle(bg, color) {
  return {
    padding: "9px 18px", background: bg, border: "none",
    borderRadius: 10, color, cursor: "pointer",
    fontFamily: "inherit", fontSize: ".8rem", fontWeight: 700,
  };
}

/* ── Server Side: جلب البيتزا من DB + التحقق من الجلسة ── */
export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  // إذا لم يكن أدمن، أعده لصفحة الدخول
  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  await connectDB();
  const pizzas = await Pizza.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();

  return {
    props: {
      pizzas: JSON.parse(JSON.stringify(pizzas)),  // serialize MongoDB objects
    },
  };
}
