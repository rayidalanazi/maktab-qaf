"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError("بريد الكتروني غير صحيح. تأكّد من الصيغة.");
      return;
    }
    if (pass.length < 6) {
      setError("كلمة المرور قصيرة. الحد الأدنى 6 أحرف.");
      return;
    }

    startTransition(async () => {
      // TODO: wire to Supabase Auth + look up tenant subdomain to redirect.
      // For now we simulate the call and show the would-be flow.
      await new Promise((r) => setTimeout(r, 800));
      setError(
        "// قريباً — Supabase Auth قيد التوصيل. هذه نسخة UI فقط.",
      );
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

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono text-[var(--text-faint)]">
          <span className="bg-[var(--bg)] px-3">أو</span>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-ghost w-full py-3"
        onClick={() =>
          setError("// تسجيل Google قريباً — يحتاج Supabase Auth أولاً.")
        }
      >
        <span className="text-base">🇬</span>
        تابع بـ Google
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
