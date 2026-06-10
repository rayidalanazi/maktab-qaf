"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Where to send a freshly-authenticated user.
 * In the current demo build, every signed-in user lands on the Raed tenant
 * (the only fully-seeded mock workspace). Once qaf's own Supabase tables are
 * populated, this will look up users.tenant_id → tenants.slug instead.
 */
const POST_LOGIN_HREF = "/t/raed";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // If a session already exists when the form mounts, jump straight to the app.
  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(POST_LOGIN_HREF);
    });
  }, [router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.includes("@")) {
      setError("بريد إلكتروني غير صحيح. تأكّد من الصيغة.");
      return;
    }
    if (pass.length < 6) {
      setError("كلمة المرور قصيرة. الحد الأدنى 6 أحرف.");
      return;
    }

    startTransition(async () => {
      try {
        const sb = getSupabase();
        const { data, error: err } = await sb.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (err) {
          setError(translateAuthError(err.message));
          return;
        }
        if (data.session) {
          setInfo("// تم — جاري نقلك للوحة التحكم...");
          router.replace(POST_LOGIN_HREF);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`صار خلل: ${msg}`);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl mb-2 leading-tight">
          أهلاً مرّة ثانية.
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          سجّل دخولك للوصول إلى مكتبك على قاف.
        </p>
      </div>

      {/* Google sign-in — top for fastest path */}
      <GoogleSignInButton
        buttonText="signin_with"
        onSuccess={(result) => {
          if (result.ok) {
            setInfo("// تم — جاري نقلك للوحة التحكم...");
            router.replace(POST_LOGIN_HREF);
          } else {
            setError(result.error || "فشل الدخول بـ Google");
          }
        }}
        onError={(err) => setError(`Google: ${err}`)}
      />

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono text-[var(--text-faint)]">
          <span className="bg-[var(--bg)] px-3">أو بالإيميل</span>
        </div>
      </div>

      <Input
        label="البريد الإلكتروني"
        type="email"
        autoComplete="email"
        inputMode="email"
        dir="ltr"
        required
        placeholder="you@firm.sa"
        value={email}
        onChange={(e) => setEmail(e.target.value.trim())}
      />

      <Input
        label="كلمة المرور"
        type={showPass ? "text" : "password"}
        autoComplete="current-password"
        required
        dir="ltr"
        placeholder="••••••••"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        rightAddon={
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="text-[var(--text-muted)] hover:text-[var(--brand)] text-xs"
            aria-label={showPass ? "إخفاء" : "إظهار"}
          >
            {showPass ? "إخفاء" : "إظهار"}
          </button>
        }
      />

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-[var(--text-muted)] cursor-pointer">
          <input
            type="checkbox"
            className="accent-[var(--brand)]"
            defaultChecked
          />
          تذكّرني
        </label>
        <Link
          href="/forgot-password"
          className="text-[var(--brand)] hover:underline"
        >
          نسيت كلمة المرور؟
        </Link>
      </div>

      {error && (
        <div className="text-[12px] text-[var(--warn)] bg-[var(--warn)]/10 border border-[var(--warn)]/30 rounded-lg p-3 leading-relaxed">
          {error}
        </div>
      )}

      {info && !error && (
        <div className="text-[12px] text-[var(--brand)] bg-[var(--brand)]/10 border border-[var(--brand)]/30 rounded-lg p-3 leading-relaxed">
          {info}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-brand w-full py-3.5 disabled:opacity-50"
      >
        {pending ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-black/30 border-t-black animate-spin" />
            جاري التحقق...
          </span>
        ) : (
          <>
            ادخل
            <span className="arrow-flip">→</span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-[var(--text-muted)] pt-2">
        ما عندك حساب بعد؟{" "}
        <Link
          href="/signup"
          className="text-[var(--brand)] font-semibold hover:underline"
        >
          أنشئ حساب مكتبك
        </Link>
      </p>
    </form>
  );
}

/**
 * Map common Supabase auth error messages to Najdi-casual Arabic.
 * Falls back to the original message if no mapping exists.
 */
function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "البريد أو كلمة المرور غلط. جرّب مرة ثانية.";
  }
  if (m.includes("email not confirmed")) {
    return "البريد ما تأكّد بعد. شيّك إنبوكسك على رابط التأكيد.";
  }
  if (m.includes("user not found")) {
    return "ما لقينا حساب بهالبريد. أنشئ حساب جديد أو راجع البريد.";
  }
  if (m.includes("too many")) {
    return "حاولت كثير. خذ نَفَس ورجع بعد دقيقة.";
  }
  if (m.includes("network")) {
    return "الشبكة قاطعة. تأكد من النت وعاود.";
  }
  return msg;
}
