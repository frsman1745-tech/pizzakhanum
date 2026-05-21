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
          background: "var(--bg-page)", minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 14, color: "var(--text-gold)", padding: 24, textAlign: "center"
        }}>
          <div style={{ fontSize: "3.5rem", opacity: .6 }}>😵</div>
          <h2 style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>{t("error_title", lang)}</h2>
          <p style={{ fontSize: ".78rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            {t("error_desc", lang)}
          </p>
          <button onClick={() => window.location.reload()}
            className="btn-gold"
            style={{
              padding: "11px 28px", borderRadius: 30,
              fontSize: ".86rem", marginTop: 8
            }}>
            {t("reload", lang)}
          </button>
          {this.props.showError && (
            <details style={{ marginTop: 16, color: "var(--text-muted-2)", fontSize: ".68rem" }}>
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
