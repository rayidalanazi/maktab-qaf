"use client";

import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from "react";
import Link from "next/link";
import { QafWordmark } from "@/components/landing/QafLogo";
import { getSupabase } from "@/lib/supabase/client";
import { isPlatformAdmin } from "@/lib/data/queries";

/**
 * REAL admin gate — the operator area is fully separate from tenant users and
 * uses USERNAME + PASSWORD ONLY (no Google, no demo passphrase):
 *
 *   • LIVE   — signed in with operator credentials AND auth.uid() ∈
 *              qaf_platform_admins → real cross-tenant data (RLS unlocks it).
 *   • DENIED — signed in but NOT a platform admin → hard refusal screen.
 *              A law-firm user can NEVER see operator data (enforced by RLS).
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

type GateState =
  | { kind: "checking" }
  | { kind: "locked" }                       // visitor: operator username + password
  | { kind: "denied"; email: string }        // signed-in non-admin
  | { kind: "live"; email: string };

/** Operators sign in with a username + password; we map it to a synthetic email. */
const OPERATOR_EMAIL_DOMAIN = "qaf-operator.app";

export function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>({ kind: "checking" });
  const [uname, setUname] = useState("");
  const [upass, setUpass] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [signErr, setSignErr] = useState<string | null>(null);

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setSignErr(null);
    const u = uname.trim().toLowerCase();
    if (!u || !upass) { setSignErr("أدخل اسم المستخدم وكلمة المرور."); return; }
    setSigningIn(true);
    try {
      const sb = getSupabase();
      const email = u.includes("@") ? u : `${u}@${OPERATOR_EMAIL_DOMAIN}`;
      const { error } = await sb.auth.signInWithPassword({ email, password: upass });
      if (error) {
        setSignErr("اسم المستخدم أو كلمة المرور غير صحيحة.");
        return;
      }
      await evaluate(); // → live if this account is a platform admin, else denied
    } catch (e) {
      setSignErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSigningIn(false);
    }
  }

  async function evaluate() {
    const sb = getSupabase();
    const { data: sess } = await sb.auth.getSession();
    const email = sess.session?.user.email ?? null;

    if (sess.session) {
      const admin = await isPlatformAdmin();
      if (admin) { setState({ kind: "live", email: email ?? "" }); return; }
      // Signed in but not an operator → explicit denial.
      setState({ kind: "denied", email: email ?? "" });
      return;
    }
    setState({ kind: "locked" });
  }

  useEffect(() => {
    void evaluate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOutAndRetry() {
    try { await getSupabase().auth.signOut(); } catch { /* ignore */ }
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

  // locked — operator gate: USERNAME + PASSWORD ONLY.
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

        <div className="mb-2 text-[11px] font-mono text-[var(--text-faint)]">
          // دخول المشغّل — اسم مستخدم وكلمة مرور
        </div>
        <form onSubmit={submitCredentials} className="space-y-2.5">
          <input
            type="text"
            autoComplete="username"
            dir="ltr"
            value={uname}
            onChange={(e) => { setUname(e.target.value); setSignErr(null); }}
            placeholder="اسم المستخدم"
            className="w-full px-3.5 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)] text-sm text-center"
          />
          <input
            type="password"
            autoComplete="current-password"
            dir="ltr"
            value={upass}
            onChange={(e) => { setUpass(e.target.value); setSignErr(null); }}
            placeholder="كلمة المرور"
            className="w-full px-3.5 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)] text-sm text-center"
          />
          {signErr && (
            <div className="text-[11px] text-[var(--danger)] text-center">{signErr}</div>
          )}
          <button type="submit" disabled={signingIn} className="btn btn-brand w-full py-3 disabled:opacity-50">
            {signingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                جاري الدخول...
              </span>
            ) : (
              <>دخول المشغّل <span className="arrow-flip">→</span></>
            )}
          </button>
        </form>

        <p className="text-[10px] text-[var(--text-faint)] text-center mt-5 font-mono">
          // الصلاحية الحقيقية تُفرض بـ RLS على مستوى قاعدة البيانات
        </p>
      </div>
    </div>
  );
}
