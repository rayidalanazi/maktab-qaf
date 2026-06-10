"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  applyTheme,
  DEFAULT_MODE,
  DEFAULT_THEME,
  MODE_KEY,
  THEME_KEY,
  type ThemeKey,
  type ThemeMode,
} from "@/lib/theme";

interface ThemeContextValue {
  mode: ThemeMode;
  theme: ThemeKey;
  setMode: (m: ThemeMode) => void;
  setTheme: (t: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [theme, setThemeState] = useState<ThemeKey>(DEFAULT_THEME);

  // Hydrate from localStorage on mount (the inline script already painted correctly).
  useEffect(() => {
    try {
      const m = (localStorage.getItem(MODE_KEY) as ThemeMode) || DEFAULT_MODE;
      const t = (localStorage.getItem(THEME_KEY) as ThemeKey) || DEFAULT_THEME;
      setModeState(m);
      setThemeState(t);
      applyTheme(m, t);
    } catch {
      // ignore
    }
  }, []);

  // React to OS theme changes while in "system" mode.
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => applyTheme("system", theme);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, theme]);

  const setMode = useCallback(
    (m: ThemeMode) => {
      setModeState(m);
      try {
        localStorage.setItem(MODE_KEY, m);
      } catch {
        /* ignore */
      }
      applyTheme(m, theme);
    },
    [theme],
  );

  const setTheme = useCallback(
    (t: ThemeKey) => {
      setThemeState(t);
      try {
        localStorage.setItem(THEME_KEY, t);
      } catch {
        /* ignore */
      }
      applyTheme(mode, t);
    },
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback no-op so components don't crash outside the provider.
    return {
      mode: DEFAULT_MODE,
      theme: DEFAULT_THEME,
      setMode: () => {},
      setTheme: () => {},
    };
  }
  return ctx;
}
