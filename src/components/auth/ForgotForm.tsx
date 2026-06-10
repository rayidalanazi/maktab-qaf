"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    startTransition(async () => {
      // TODO: wire to Supabase Auth resetPasswordForEmail
      await new Promise((r) => setTimeout(r, 700));
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--brand)]/30 bg-[var(--brand)]/8 p-5 text-center">
        <div className="text-4xl mb-2">📬</div>
        <h3 className="font-bold text-lg mb-2">شيّك بريدك</h3>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          إذا الحساب موجود، أرسلنا رابط الإعادة على{" "}
          <span className="text-[var(--brand)] font-mono">{email}</span>.
          <br />
          الرابط صالح 30 دقيقة.
        </p>
        <p className="text-[10px] text-[var(--text-faint)] mt-3 font-mono">
          // ما لقيت البريد؟ شف Spam / Junk أيضاً.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
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
      <button
        type="submit"
        disabled={pending}
        className="btn btn-brand w-full py-3.5 disabled:opacity-50"
      >
        {pending ? "جاري الإرسال..." : "أرسل رابط الإعادة"}
      </button>
    </form>
  );
}
