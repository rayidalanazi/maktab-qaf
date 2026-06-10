import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول | قاف",
  description: "سجّل دخولك لمنصة قاف لإدارة مكتبك القانوني.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      side={
        <div className="max-w-md">
          <span className="pill pill-brand mb-6 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" />
            // مرحباً
          </span>
          <h2 className="font-display font-black text-5xl mb-5 leading-tight">
            مكتبك،
            <br />
            <span className="text-gradient-brand">في انتظارك.</span>
          </h2>
          <p className="text-[var(--text-muted)] text-base leading-relaxed mb-8">
            ادخل، شف القضايا اللي تستحقّ انتباهك، ووظّف وقتك على اللي يهم.
          </p>

          <ul className="space-y-2.5 text-sm">
            {[
              "بيانات مشفّرة AES-256",
              "تسجيل دخول واحد لكل النظام",
              "دعم نفاذ قريباً — إضافة 39 ر.س",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-[var(--text-muted)]">
                <span className="text-[var(--brand)] mt-0.5">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
