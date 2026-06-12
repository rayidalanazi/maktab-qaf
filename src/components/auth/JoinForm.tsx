"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { getSupabase } from "@/lib/supabase/client";
import { lookupInvite, acceptInviteToken } from "@/lib/data/queries";
import type { InviteLookup } from "@/lib/data/types";

const APP_SHELL_HREF = "/t/app";

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام", general_manager: "مدير عام", manager: "مدير القضايا",
  lawyer: "محامي", consultant: "مستشار قانوني", auditor: "مدقّق قانوني",
  accountant: "محاسب", secretary: "سكرتير", marketer: "مسوّق",
};

function reasonMsg(reason?: string): string {
  switch (reason) {
    case "expired": return "انتهت صلاحية رابط الدعوة. اطلب من المالك رابطاً جديداً.";
    case "used": return "هذه الدعوة استُخدمت من قبل. اطلب رابطاً جديداً.";
    case "already_in_firm": return "أنت منضمّ لمكتب بالفعل.";
    case "not_found":
    case "invalid": return "رابط الدعوة غير صالح أو ناقص.";
    default: return "تعذّر إتمام الانضمام. حاول مجددًا.";
  }
}

export function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("t") || "";

  const [invite, setInvite] = useState<InviteLookup | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    if (!token) { setInvite({ ok: false, reason: "invalid" }); setLoadingInvite(false); return; }
    lookupInvite(token).then((r) => {
      if (cancelled) return;
      setInvite(r);
      if (r.ok) { setEmail(r.email || ""); setFullName(r.full_name || ""); }
      setLoadingInvite(false);
    });
    return () => { cancelled = true; };
  }, [token]);

  async function finishJoin(): Promise<void> {
    const r = await acceptInviteToken(token);
    if (r.ok || r.reason === "already_in_firm") { router.replace(APP_SHELL_HREF); return; }
    setError(reasonMsg(r.reason));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) { setError("بريد إلكتروني غير صحيح."); return; }
    if (pass.length < 6) { setError("كلمة المرور قصيرة (6 أحرف على الأقل)."); return; }
    startTransition(async () => {
      try {
        const sb = getSupabase();
        let session = (await sb.auth.getSession()).data.session;
        if (!session) {
          const { data, error: err } = await sb.auth.signUp({
            email, password: pass, options: { data: { full_name: fullName } },
          });
          if (err) {
            if (/already/i.test(err.message)) {
              const { data: d2, error: e2 } = await sb.auth.signInWithPassword({ email, password: pass });
              if (e2) { setError("لديك حساب بهذا البريد — تأكد من كلمة المرور أو سجّل الدخول."); return; }
              session = d2.session;
            } else { setError(err.message); return; }
          } else { session = data.session; }
        }
        if (session) await finishJoin();
        else setError("تعذّر إنشاء الجلسة. حاول مجددًا.");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  if (loadingInvite) {
    return <div className="text-sm text-[var(--text-muted)]">جارٍ التحقق من الدعوة…</div>;
  }

  if (!invite?.ok) {
    return (
      <div className="space-y-4">
        <h1 className="font-display font-black text-3xl mb-1">رابط الدعوة</h1>
        <div className="text-[13px] text-[var(--warn)] bg-[var(--warn)]/10 border border-[var(--warn)]/30 rounded-lg p-3.5 leading-relaxed">
          {reasonMsg(invite?.reason)}
        </div>
        <p className="text-center text-xs text-[var(--text-muted)] pt-2">
          عندك حساب؟{" "}
          <Link href="/login" className="text-[var(--brand)] font-semibold hover:underline">سجّل الدخول</Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <span className="pill pill-brand mb-3 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" />
          دعوة انضمام
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl mb-2 leading-tight">
          انضمّ إلى <span className="text-gradient-brand">{invite.firm}</span>
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          دُعيت كـ«{ROLE_LABELS[invite.role || "lawyer"] ?? invite.role}». أنشئ حسابك للانضمام كموظف بالمكتب.
        </p>
      </div>

      <GoogleSignInButton
        buttonText="signup_with"
        onSuccess={(result) => {
          if (result.ok) startTransition(async () => { await finishJoin(); });
          else setError(result.error || "فشل الدخول بـ Google");
        }}
        onError={(err) => setError(`Google: ${err}`)}
      />

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono text-[var(--text-faint)]">
          <span className="bg-[var(--bg)] px-3">أو بالإيميل</span>
        </div>
      </div>

      <Input label="الاسم" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="اسمك الكامل" />
      <Input
        label="البريد الإلكتروني" type="email" dir="ltr" inputMode="email" autoComplete="email"
        value={email} onChange={(e) => setEmail(e.target.value.trim())} placeholder="you@firm.sa"
      />
      <Input
        label="كلمة المرور" type="password" dir="ltr" autoComplete="new-password"
        value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••"
      />

      {error && (
        <div className="text-[12px] text-[var(--warn)] bg-[var(--warn)]/10 border border-[var(--warn)]/30 rounded-lg p-3 leading-relaxed">
          {error}
        </div>
      )}

      <button type="submit" disabled={pending} className="btn btn-brand w-full py-3.5 disabled:opacity-50">
        {pending ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-black/30 border-t-black animate-spin" />
            جاري الانضمام...
          </span>
        ) : (
          <>انضمّ الآن<span className="arrow-flip">→</span></>
        )}
      </button>

      <p className="text-center text-xs text-[var(--text-muted)] pt-2">
        عندك حساب أصلاً؟{" "}
        <Link href="/login" className="text-[var(--brand)] font-semibold hover:underline">سجّل الدخول</Link>
      </p>
    </form>
  );
}
