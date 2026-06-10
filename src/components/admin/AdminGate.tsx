"use client";

import { useEffect, useState } from "react";
import { QafWordmark } from "@/components/landing/QafLogo";

/**
 * Lightweight gate for the PUBLIC demo (GitHub Pages has no backend).
 * It keeps casual visitors out of the admin panel with a demo passphrase.
 *
 * ⚠️ This is NOT real security — the check runs client-side. In production
 * (admin.qaf.sa on the VPS) this component is replaced by a real Supabase
 * session check against the `platform_admins` table (Google sign-in + allow-list).
 */
const DEMO_PASSPHRASE = "qaf-admin";
const UNLOCK_KEY = "qaf-admin-unlocked";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(UNLOCK_KEY) === "1") setUnlocked(true);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (val.trim().toLowerCase() === DEMO_PASSPHRASE) {
      try {
        sessionStorage.setItem(UNLOCK_KEY, "1");
      } catch {
        /* ignore */
      }
      setUnlocked(true);
    } else {
      setErr(true);
    }
  }

  // Avoid flashing the gate before we've read sessionStorage.
  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div
      className="min-h-screen grid place-items-center p-6 bg-[var(--bg)] text-[var(--text)] bg-noise relative"
      dir="rtl"
    >
      <div
        className="blob"
        style={{ background: "var(--accent)", width: 500, height: 500, top: -150, left: -120, opacity: 0.12 }}
      />
      <form
        onSubmit={submit}
        className="relative w-full max-w-sm rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elev)] p-7 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <QafWordmark />
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--accent)] text-white">
            ADMIN
          </span>
        </div>
        <h1 className="font-display font-black text-2xl mb-1">لوحة الإدارة</h1>
        <p className="text-xs text-[var(--text-muted)] mb-5 leading-relaxed">
          هذه المنطقة محمية. أدخل عبارة الوصول للنسخة التجريبية.
          <br />
          <span className="text-[10px] text-[var(--text-faint)] font-mono">
            // في الإنتاج: دخول Google + قائمة platform_admins
          </span>
        </p>

        <input
          type="password"
          autoFocus
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setErr(false);
          }}
          placeholder="عبارة الوصول"
          dir="ltr"
          className="w-full px-3.5 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)] text-sm text-center"
        />
        {err && (
          <div className="mt-2 text-[11px] text-[var(--danger)] text-center">
            عبارة غير صحيحة. حاول مرة ثانية.
          </div>
        )}

        <button type="submit" className="btn btn-brand w-full mt-4 py-3">
          دخول
          <span className="arrow-flip">→</span>
        </button>

        <p className="text-[10px] text-[var(--text-faint)] text-center mt-4 font-mono">
          // نسخة عرض — الحماية الحقيقية على admin.qaf.sa
        </p>
      </form>
    </div>
  );
}
