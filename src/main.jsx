import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { SettingsProvider } from "./contexts/SettingsContext.jsx";
import { initSecurity } from "./lib/security.js";

initSecurity();

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || "/admin";

const AdminPage = lazy(() => import("./Admin.jsx"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SettingsProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path={`${ADMIN_PATH}/*`} element={
              <Suspense fallback={
                <div style={{
                  minHeight: "100vh", background: "#0a0a0a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column", gap: 12, color: "#C8A96A",
                  fontFamily: "'Noto Kufi Arabic',sans-serif"
                }}>
                  <div style={{
                    width: 30, height: 30,
                    border: "3px solid #C8A96A22", borderTopColor: "#C8A96A",
                    borderRadius: "50%", animation: "spin .7s linear infinite"
                  }} />
                  <p style={{ fontSize: ".82rem", opacity: .5 }}>Loading Admin...</p>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              }>
                <AdminPage />
              </Suspense>
            } />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </SettingsProvider>
  </StrictMode>
);
