/**
 * Theme + mode model for قاف.
 * Two independent axes the user picks: MODE (dark/light/system) and THEME (palette).
 */

export type ThemeMode = "dark" | "light" | "system";
export type ThemeKey = "lime" | "royal" | "ocean" | "sand" | "crimson" | "emerald";

export const THEMES: {
  key: ThemeKey;
  label_ar: string;
  desc_ar: string;
  swatch: string; // representative brand color for the picker dot
}[] = [
  { key: "lime", label_ar: "قاف الكلاسيكي", desc_ar: "أخضر ليموني كهربائي", swatch: "#D6FF3D" },
  { key: "royal", label_ar: "ملكي", desc_ar: "ذهبي + بنفسجي فاخر", swatch: "#E7C27D" },
  { key: "ocean", label_ar: "محيط", desc_ar: "أزرق + فيروزي هادئ", swatch: "#38BDF8" },
  { key: "sand", label_ar: "رملي", desc_ar: "ترابي محافظ ودافئ", swatch: "#D2A86A" },
  { key: "crimson", label_ar: "قرمزي", desc_ar: "أحمر + برتقالي جريء", swatch: "#FB6F84" },
  { key: "emerald", label_ar: "زمردي", desc_ar: "أخضر طبيعي منعش", swatch: "#34D399" },
];

export const MODES: { key: ThemeMode; label_ar: string; icon: string }[] = [
  { key: "light", label_ar: "فاتح", icon: "☀" },
  { key: "dark", label_ar: "داكن", icon: "🌙" },
  { key: "system", label_ar: "النظام", icon: "🖥" },
];

export const DEFAULT_MODE: ThemeMode = "dark";
export const DEFAULT_THEME: ThemeKey = "lime";

export const MODE_KEY = "qaf-mode";
export const THEME_KEY = "qaf-theme";

/** Resolve "system" to the actual dark/light using the media query. */
export function resolveMode(mode: ThemeMode): "dark" | "light" {
  if (mode === "system") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    return "dark";
  }
  return mode;
}

/** Apply mode+theme to <html>. Safe to call client-side only. */
export function applyTheme(mode: ThemeMode, theme: ThemeKey) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.dataset.mode = resolveMode(mode);
  el.dataset.theme = theme;
}

/**
 * Inline script (string) injected into <head> to set data-mode/data-theme
 * BEFORE first paint — kills the flash of default theme on load.
 */
export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var m = localStorage.getItem('${MODE_KEY}') || '${DEFAULT_MODE}';
    var t = localStorage.getItem('${THEME_KEY}') || '${DEFAULT_THEME}';
    var rm = m;
    if (m === 'system') {
      rm = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    }
    var el = document.documentElement;
    el.setAttribute('data-mode', rm);
    el.setAttribute('data-theme', t);
  } catch(e){}
})();
`;
