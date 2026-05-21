import { Component } from "react";
import { t } from "../translations.js";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const lang = document.documentElement.getAttribute("lang") || "ar";
      return (
        <div dir={lang === "ar" ? "rtl" : "ltr"} style={{
          fontFamily: "'Noto Kufi Arabic',sans-serif",
          background: "#0f0f0f", minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 14, color: "#C8A96A", padding: 24, textAlign: "center"
        }}>
          <div style={{ fontSize: "3.5rem", opacity: .6 }}>😵</div>
          <h2 style={{ fontSize: "1.1rem", color: "#E5D3B3" }}>{t("error_title", lang)}</h2>
          <p style={{ fontSize: ".78rem", color: "#8B6B4A", lineHeight: 1.7 }}>
            {t("error_desc", lang)}
          </p>
          <button onClick={() => window.location.reload()}
            style={{
              padding: "11px 28px", borderRadius: 30,
              background: "linear-gradient(135deg,#C8A96A,#8B6B4A,#C8A96A)",
              border: "none", color: "#0f0f0f", fontWeight: 700,
              fontSize: ".86rem", cursor: "pointer",
              fontFamily: "inherit", marginTop: 8
            }}>
            {t("reload", lang)}
          </button>
          {this.props.showError && (
            <details style={{ marginTop: 16, color: "#444", fontSize: ".68rem" }}>
              <summary style={{ cursor: "pointer" }}>{t("error_details", lang)}</summary>
              <pre style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                {this.state.error?.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
