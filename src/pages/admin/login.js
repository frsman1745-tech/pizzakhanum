// pages/admin/login.js
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const router   = useRouter();
  const [form,   setForm]   = useState({ username: "", password: "" });
  const [error,  setError]  = useState("");
  const [loading,setLoading]= useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username: form.username,
      password: form.password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/admin");
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
    setLoading(false);
  }

  return (
    <div dir="rtl" style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 30% 40%,#1f1508,#0f0f0f 60%,#0a0a0a)",
      fontFamily: "'Noto Kufi Arabic', sans-serif",
    }}>
      <div style={{
        background: "#141414", border: "1px solid #C8A96A33",
        borderRadius: 20, padding: "40px 32px", width: "100%", maxWidth: 380,
        boxShadow: "0 20px 60px #00000088",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🍕</div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#C8A96A", marginBottom: 4 }}>
            بيتزا خانم
          </h1>
          <p style={{ fontSize: ".75rem", color: "#8B6B4A" }}>لوحة تحكم الأدمن</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#2a0a0a", border: "1px solid #ef444433",
            borderRadius: 10, padding: "10px 14px", marginBottom: 20,
            fontSize: ".78rem", color: "#ef4444", textAlign: "center",
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: ".72rem", color: "#C8A96A88", marginBottom: 8, letterSpacing: "1px" }}>
              اسم المستخدم
            </label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              style={inputStyle}
              placeholder="admin"
              required
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: ".72rem", color: "#C8A96A88", marginBottom: 8, letterSpacing: "1px" }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              style={inputStyle}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px",
              background: loading ? "#333" : "linear-gradient(135deg,#C8A96A,#8B6B4A,#C8A96A)",
              backgroundSize: "200% auto",
              border: "none", borderRadius: 12,
              fontSize: ".92rem", fontWeight: 700,
              color: loading ? "#666" : "#0f0f0f",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all .3s",
            }}
          >
            {loading ? "جارٍ التحقق..." : "دخول →"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 14px",
  background: "#1a1a1a", border: "1px solid #2a2a2a",
  borderRadius: 10, color: "#E5D3B3",
  fontSize: ".88rem", fontFamily: "inherit", outline: "none",
};

// إذا كان الأدمن مسجل دخول بالفعل، انقله مباشرة للداشبورد
export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (session?.user?.role === "admin") {
    return { redirect: { destination: "/admin", permanent: false } };
  }
  return { props: {} };
}
