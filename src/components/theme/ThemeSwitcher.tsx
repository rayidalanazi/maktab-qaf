"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { THEMES, MODES } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Compact theme switcher used in the Topbar (a single icon button → popover).
 */
export function ThemeSwitcher() {
  const { mode, theme, setMode, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const activeMode = MODES.find((m) => m.key === mode);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="تغيير المظهر"
        className="w-10 h-10 rounded-lg grid place-items-center text-lg hover:bg-[var(--bg-hover)] transition-colors"
      >
        🎨
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 z-50 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] shadow-2xl p-3">
          {/* Mode */}
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] mb-2">
            // الوضع
          </div>
          <div className="flex gap-1.5 mb-4">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors flex flex-col items-center gap-1",
                  mode === m.key
                    ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]",
                )}
              >
                <span className="text-base">{m.icon}</span>
                {m.label_ar}
              </button>
            ))}
          </div>

          {/* Theme palette */}
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] mb-2">
            // اللون
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTheme(t.key)}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border text-right transition-colors",
                  theme === t.key
                    ? "border-[var(--brand)] bg-[var(--brand)]/8"
                    : "border-[var(--border)] hover:border-[var(--border-strong)]",
                )}
              >
                <span
                  className="w-5 h-5 rounded-full shrink-0 border border-black/10"
                  style={{ background: t.swatch }}
                />
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold truncate">{t.label_ar}</span>
                </span>
                {theme === t.key && (
                  <span className="text-[var(--brand)] text-xs ms-auto">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-[var(--border)] text-[10px] text-[var(--text-faint)] text-center">
            {activeMode?.label_ar} · {THEMES.find((t) => t.key === theme)?.label_ar}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Full theme picker used in the Settings page (shows all options expanded).
 */
export function ThemePickerPanel() {
  const { mode, theme, setMode, setTheme } = useTheme();

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold mb-2">الوضع</div>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={cn(
                "py-3 rounded-xl border transition-all flex flex-col items-center gap-1.5",
                mode === m.key
                  ? "border-[var(--brand)] bg-[var(--brand)]/10"
                  : "border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--bg-card)]",
              )}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs font-semibold">{m.label_ar}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">اللون</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTheme(t.key)}
              className={cn(
                "p-3 rounded-xl border text-right transition-all flex items-center gap-3",
                theme === t.key
                  ? "border-[var(--brand)] bg-[var(--brand)]/8"
                  : "border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--bg-card)]",
              )}
            >
              <span
                className="w-8 h-8 rounded-full shrink-0 border border-black/10"
                style={{ background: t.swatch }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold truncate">{t.label_ar}</span>
                <span className="block text-[10px] text-[var(--text-faint)] truncate">
                  {t.desc_ar}
                </span>
              </span>
              {theme === t.key && <span className="text-[var(--brand)]">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
