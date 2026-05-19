// src/features/menu/LandingScreen.jsx

import useUiStore from "../../store/uiStore.js";
import { FLOATERS } from "../../constants/defaults.js";

export default function LandingScreen() {
  const setScreen = useUiStore((s) => s.setScreen);
  const siteName  = localStorage.getItem("site_name")   || "بيتزا خانم";
  const slogan    = localStorage.getItem("site_slogan")  || "كُل لتعيش · وعِش لأجل البيتزا";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 30% 40%,#1f1508,#0f0f0f 60%,#0a0a0a)",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        padding: 24,
      }}
    >
      {/* Floating emojis */}
      {FLOATERS.map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            fontSize: "1.7rem",
            opacity: 0.15,
            left: f.l,
            top: f.t,
            animation: `floatUp ${f.d}s ease-in-out ${f.dl}s infinite`,
            pointerEvents: "none",
          }}
        >
          {f.e}
        </div>
      ))}

      <div className="fade-up" style={{ maxWidth: 400 }}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "2px solid var(--gold-alpha-20)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            animation: "glow 3s ease-in-out infinite",
            fontSize: "2.8rem",
          }}
        >
          🍕
        </div>

        <h1
          style={{
            fontSize: "clamp(2.6rem,9vw,4rem)",
            fontWeight: 900,
            background: "linear-gradient(135deg,var(--gold),var(--gold-light),var(--gold-dark),var(--gold))",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer 4s linear infinite",
            lineHeight: 1.1,
            marginBottom: 11,
          }}
        >
          {siteName}
        </h1>

        <p
          style={{
            fontSize: "clamp(.85rem,3vw,.95rem)",
            color: "var(--gold-dark)",
            marginBottom: 44,
            fontWeight: 300,
            letterSpacing: ".5px",
            lineHeight: 1.8,
          }}
        >
          {slogan}
        </p>

        <button
          className="btn-gold"
          onClick={() => setScreen("menu")}
          style={{
            padding: "15px 48px",
            borderRadius: "var(--radius-pill)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#0f0f0f",
            letterSpacing: "1px",
            animation: "glow 3s ease-in-out infinite",
          }}
        >
          ابدأ الطلب ✨
        </button>
      </div>
    </div>
  );
}
