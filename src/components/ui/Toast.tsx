"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastKind = "success" | "info" | "warn" | "error";
interface ToastItem {
  id: number;
  kind: ToastKind;
  msg: string;
}

interface ToastCtx {
  toast: (msg: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

const ICON: Record<ToastKind, string> = {
  success: "✓",
  info: "ℹ",
  warn: "⚠",
  error: "✕",
};
const COLOR: Record<ToastKind, string> = {
  success: "var(--success)",
  info: "var(--info)",
  warn: "var(--warn)",
  error: "var(--danger)",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((msg: string, kind: ToastKind = "success") => {
    const id = Math.floor(performance.now() * 1000) + Math.floor(performance.now() % 1000);
    setItems((prev) => [...prev, { id, kind, msg }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-[min(92vw,380px)]"
        dir="rtl"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-[var(--bg-elev)] shadow-2xl animate-float-up"
            style={{ borderColor: `color-mix(in srgb, ${COLOR[t.kind]} 40%, transparent)` }}
          >
            <span
              className="w-6 h-6 rounded-full grid place-items-center text-xs font-bold shrink-0"
              style={{ background: `color-mix(in srgb, ${COLOR[t.kind]} 18%, transparent)`, color: COLOR[t.kind] }}
            >
              {ICON[t.kind]}
            </span>
            <span className="text-sm">{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
