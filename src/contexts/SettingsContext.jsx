import { createContext, useContext, useState, useEffect, useCallback } from "react";

const THEME_KEY = "pizza_theme";
const LANG_KEY = "pizza_lang";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || "dark"; }
    catch { return "dark"; }
  });

  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || "ar"; }
    catch { return "ar"; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
    try {
      localStorage.setItem(THEME_KEY, theme);
      localStorage.setItem(LANG_KEY, lang);
    } catch { }
  }, [theme, lang]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === "dark" ? "light" : "dark");
  }, []);

  const toggleLang = useCallback(() => {
    setLangState(prev => prev === "ar" ? "en" : "ar");
  }, []);

  return (
    <SettingsContext.Provider value={{ theme, lang, toggleTheme, toggleLang }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
