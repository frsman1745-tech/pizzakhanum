// src/App.jsx
// Thin router — replaces the 600-line monolith.
// Reads screen from Zustand and renders the appropriate feature screen.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useUiStore from "./store/uiStore.js";
import Spinner    from "./components/ui/Spinner.jsx";
import React, { Suspense, lazy } from "react";

// Lazy-load screens so each route only loads its code when visited
const LandingScreen     = lazy(() => import("./features/menu/LandingScreen.jsx"));
const MenuScreen        = lazy(() => import("./features/menu/MenuScreen.jsx"));
const SummaryScreen     = lazy(() => import("./features/menu/SummaryScreen.jsx"));

// التعديل هنا: استيراد الشاشات الثلاثة بأسلوب lazy متوافق بدون استخدام await خارجي
const BuilderScreen     = lazy(() => import("./features/menu/Screens.jsx").then(module => ({ default: module.BuilderScreen })));
const KhanamScreen      = lazy(() => import("./features/menu/Screens.jsx").then(module => ({ default: module.KhanamScreen })));
const PizzaDetailScreen = lazy(() => import("./features/menu/Screens.jsx").then(module => ({ default: module.PizzaDetailScreen })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingFallback() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "var(--bg-base)" }}>
      <Spinner size={36} />
      <p style={{ fontSize: ".82rem", color: "var(--gold)", opacity: .5 }}>جاري التحضير...</p>
    </div>
  );
}

function CustomerApp() {
  const screen = useUiStore((s) => s.screen);

  return (
    <Suspense fallback={<LoadingFallback />}>
      {screen === "landing"      && <LandingScreen />}
      {screen === "menu"         && <MenuScreen />}
      {screen === "builder"      && <BuilderScreen />}
      {screen === "khanum"       && <KhanamScreen />}
      {screen === "pizza_detail" && <PizzaDetailScreen />}
      {screen === "summary"      && <SummaryScreen />}
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomerApp />
    </QueryClientProvider>
  );
}
