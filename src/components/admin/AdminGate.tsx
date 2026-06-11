"use client";

import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from "react";
import Link from "next/link";
import { QafWordmark } from "@/components/landing/QafLogo";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { getSupabase } from "@/lib/supabase/client";
import { isPlatformAdmin } from "@/lib/data/queries";

/**
 * REAL admin gate — the operator area is fully separate from tenant users:
 *
 *   • LIVE  — signed in with Google AND auth.uid() ∈ qaf_platform_admins
 *             → real cross-tenant data (RLS unlocks it server-side).
 *   • DENIED — signed in but NOT a platform admin → hard refusal screen.
 *             A law-firm user can NEVER see operator data (enforced by RLS,
 *             not just this UI).
 *   • DEMO  — passphrase-unlocked showcase with mock data + a loud banner.
 *
 * Admin pages read the mode via useAdminSession()/useAdminData().
 */

export type AdminMode = "loading" | "live" | "demo";

interface AdminSessionState {
  mode: AdminMode;
  email: string | null;
}

const AdminCtx = createContext<AdminSessionState>({ mode: "demo", email: null });

export function useAdminSession(): AdminSessionState {
  return useContext(AdminCtx);
}

const DEMO_PASSPHRASE = "qaf-admin";
const UNLOCK_KEY = "qaf-admin-unlocked";

type GateState =
  | { kind: "checking" }
  | { kind: "locked" }                       // visitor: sign-in or demo passphrase
  | { kind: "denied"; email: string }        // signed-in non-admin
  | { kind: "live"; email: string }
  | { kind: "demo" };

export function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>({ kind: "checking" });
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  async function evaluate() {
    const sb = getSupabase();
    const { data: sess } = await sb.auth.getSession();
    const email = sess.session?.user.email ?? null;

    if (sess.session) {
      const admin = await isPlatformAdmin();
      if (admin) {
        setState({ kind: "live", email: email ?? "" });
        return;
      }
      // Signed in but not an operator → explicit denial (demo still possible).
      try {
        if (sessionStorage.getItem(UNLOCK_KEY) === "1") {
          setState({ kind: "demo" });
          return;
        }
      } catch { /* ignore */ }
      setState({ kind: "denied", email: email ?? "" });
      return;
    }

    try {
      if (sessionStorage.getItem(UNLOCK_KEY) === "1") {
        setState({ kind: "demo" });
        return;
      }
    } catch { /* ignore */ }
    setState({ kind: "locked" });
  }

  useEffect(() => {
    void evaluate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submitDemo(e: React.FormEvent) {
    e.preventDefault();
    if (val.trim().toLowerCase() === DEMO_PASSPHRASE) {
      try { sessionStorage.setItem(UNLOCK_KEY, "1"); } catch { /* ignore */ }
      setState({ kind: "demo" });
    } else {
      setErr(true);
    }
  }

  async function signOutAndRetry() {
    try { await getSupabase().auth.signOut(); } catch { /* ignore */ }
    try { sessionStorage.removeItem(UNLOCK_KEY); } catch { /* ignore */ }
    setState({ kind: "locked" });
  }

  if (state.kind === "checking") {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--bg)] text-[var(--text)]" dir="rtl">
        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
          <span className="w-4 h-4 rounded-full border-2 border-[var(--brand)]/30 border-t-[var(--brand)] animate-spin" />
          جاري التحقق من صلاحيات المشغّل...
        </div>
      </div>
    );
  }

  if (state.kind === "live") {
    return (
      <AdminCtx.Provider value={{ mode: "live", email: state.email }}>
        <div className="bg-[var(--success)]/10 border-b border-[var(--success)]/30 text-[var(--success)] text-[11px] font-mono px-4 py-1.5 flex items-center justify-between gap-2" dir="rtl">
          <span className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse shrink-0" />
            <span className="truncate">
              بيانات حية — مشغّل المنصة: <span dir="ltr">{state.email}</span>
            </span>
          </span>
          <button
            onClick={signOutAndRetry}
            className="shrink-0 underline hover:no-underline text-[var(--danger)]"
            title="تسجيل خروج من حساب المشغّل"
          >
            ⏻ تسجيل خروج
          </button>
        </div>
        {children}
      </AdminCtx.Provider>
    );
  }

  if (state.kind === "demo") {
    return (
      <AdminCtx.Provider value={{ mode: "demo", email: null }}>
        <div className="bg-[var(--warn)]/10 border-b border-[var(--warn)]/30 text-[var(--warn)] text-[11px] font-mono px-4 py-1.5 flex items-center justify-between gap-2" dir="rtl">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--warn)]" />
            وضع العرض — بيانات تجريبية فقط، لا تعكس مكاتب حقيقية
          </span>
          <button onClick={signOutAndRetry} className="underline hover:no-underline">
            دخول المشغّل ←
          </button>
        </div>
        {children}
      </AdminCtx.Provider>
    );
  }

  if (state.kind === "denied") {
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-[var(--bg)] text-[var(--text)] bg-noise relative" dir="rtl">
        <div className="relative w-full max-w-sm rounded-2xl border border-[var(--danger)]/40 bg-[var(--bg-elev)] p-7 shadow-2xl text-center">
          <div className="text-4xl mb-3">⛔</div>
          <h1 className="font-display font-black text-2xl mb-2">غير مصرّح</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-1">
            الحساب <span className="font-mono text-xs" dir="ltr">{state.email}</span>
          </p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-5">
            ليس من مشغّلي منصة قاف. هذه المنطقة مخصصة لإدارة المنصة فقط —
            وليست جزءاً من حساب مكتبك.
          </p>
          <div className="space-y-2">
            <Link href="/t/app" className="btn btn-brand w-full py-2.5 text-sm">
              ← العودة لمكتبك
            </Link>
            <button onClick={signOutAndRetry} className="btn btn-ghost w-full py-2.5 text-sm">
              تسجيل خروج والدخول بحساب آخر
            </button>
          </div>
          <p className="text-[10px] text-[var(--text-faint)] mt-4 font-mono">
            // الصلاحية تُمنح من جدول qaf_platform_admins حصراً
          </p>
        </div>
      </div>
    );
  }

  // locked — visitor gate: operator sign-in OR demo passphrase.
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-[var(--bg)] text-[var(--text)] bg-noise relative" dir="rtl">
      <div
        className="blob"
        style={{ background: "var(--accent)", width: 500, height: 500, top: -150, left: -120, opacity: 0.12 }}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elev)] p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <QafWordmark />
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--accent)] text-white">
            OPERATOR
          </span>
        </div>
        <h1 className="font-display font-black text-2xl mb-1">منطقة المشغّل</h1>
        <p className="text-xs text-[var(--text-muted)] mb-5 leading-relaxed">
          هذه لوحة إدارة <b>منصة قاف نفسها</b> — وليست دخول المكاتب.
          مكاتب المحاماة تدخل من <Link href="/login" className="text-[var(--brand)] hover:underline">صفحة الدخول</Link>.
        </p>

        {/* Operator path: real Google sign-in + platform_admins check */}
        <div className="mb-2 text-[11px] font-mono text-[var(--text-faint)]">
          // دخول المشغّل (بيانات حية)
        </div>
        <GoogleSignInButton
          buttonText="signin_with"
          onSuccess={() => { void evaluate(); }}
          onError={() => { /* surfaced inside the button */ }}
        />

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono text-[var(--text-faint)]">
            <span className="bg-[var(--bg-elev)] px-3">أو عرض تجريبي</span>
          </div>
        </div>

        <form onSubmit={submitDemo}>
          <input
            type="password"
            value={val}
            onChange={(e) => { setVal(e.target.value); setErr(false); }}
            placeholder="عبارة العرض التجريبي"
            dir="ltr"
            className="w-full px-3.5 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)] text-sm text-center"
          />
          {err && (
            <div className="mt-2 text-[11px] text-[var(--danger)] text-center">
              عبارة غير صحيحة. حاول مرة ثانية.
            </div>
          )}
          <button type="submit" className="btn btn-ghost w-full mt-3 py-2.5 text-sm">
            دخول وضع العرض (بيانات تجريبية)
          </button>
        </form>

        <p className="text-[10px] text-[var(--text-faint)] text-center mt-4 font-mono">
          // الصلاحية الحقيقية تُفرض بـ RLS على مستوى قاعدة البيانات
        </p>
      </div>
    </div>
  );
}
