import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { JoinForm } from "@/components/auth/JoinForm";

export const metadata: Metadata = {
  title: "انضمام للفريق | قاف",
  description: "انضمّ إلى مكتبك على قاف عبر رابط الدعوة.",
};

export default function JoinPage() {
  return (
    <AuthLayout
      side={
        <div className="max-w-md">
          <span className="pill pill-brand mb-6 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" />
            // أهلاً بالفريق
          </span>
          <h2 className="font-display font-black text-5xl mb-5 leading-tight">
            مكانك
            <br />
            <span className="text-gradient-brand">في المكتب.</span>
          </h2>
          <p className="text-[var(--text-muted)] text-base leading-relaxed mb-8">
            دعاك مالك المكتب للانضمام. أنشئ حسابك بنقرات، وابدأ العمل فورًا — قضاياك، مهامك، وحضورك في مكان واحد.
          </p>
          <ul className="space-y-2.5 text-sm">
            {["انضمام بنقرة عبر الرابط", "حسابك الخاص داخل مكتبك", "كل شيء معزول وآمن"].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-[var(--text-muted)]">
                <span className="text-[var(--brand)] mt-0.5">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <Suspense fallback={<div className="text-sm text-[var(--text-muted)]">جارٍ تحميل الدعوة…</div>}>
        <JoinForm />
      </Suspense>
    </AuthLayout>
  );
}
