import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupWizard } from "@/components/auth/SignupWizard";

export const metadata: Metadata = {
  title: "ابدأ تجربة مجانية | قاف",
  description:
    "14 يوم تجربة مجانية لمنصة قاف. بدون بطاقة ائتمان. بدون التزام.",
};

const VALUE_PROPS = [
  "بدون بطاقة ائتمان",
  "14 يوم تجربة كاملة",
  "تفعيل فوري — بدون انتظار",
  "نطاق خاص بمكتبك .qaf.sa",
  "إلغاء بضغطة زر، بدون أسئلة",
];

export default function SignupPage() {
  return (
    <AuthLayout
      side={
        <div className="max-w-md">
          <span className="pill pill-brand mb-6 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" />
            // أقل من دقيقة
          </span>

          <h2 className="font-display font-black text-4xl sm:text-5xl mb-5 leading-tight">
            مكتبك يستاهل
            <br />
            <span className="text-gradient-brand">أحسن من Excel.</span>
          </h2>

          <p className="text-[var(--text-muted)] text-base leading-relaxed mb-8">
            قاف يدير قضاياك، فواتيرك، وفريقك من مكان واحد. ابدأ في أقل من دقيقة.
          </p>

          <ul className="space-y-2.5 text-sm mb-8">
            {VALUE_PROPS.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[var(--text-muted)]"
              >
                <span className="text-[var(--brand)] mt-0.5 shrink-0">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="text-xs text-[var(--text-faint)] font-mono p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
            // عندك حساب؟{" "}
            <Link href="/login" className="text-[var(--brand)] hover:underline">
              ادخل من هنا
            </Link>
          </div>
        </div>
      }
    >
      <SignupWizard />
    </AuthLayout>
  );
}
