import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata: Metadata = {
  title: "نسيت كلمة المرور | قاف",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      side={
        <div className="max-w-md">
          <span className="pill pill-brand mb-6 text-xs">
            // نسيت كلمة المرور
          </span>
          <h2 className="font-display font-black text-5xl mb-5 leading-tight">
            يصير. ما
            <br />
            <span className="text-gradient-brand">حد كامل.</span>
          </h2>
          <p className="text-[var(--text-muted)] text-base leading-relaxed">
            أعطنا بريدك، وبنرسل لك رابط إعادة التعيين خلال ثوانٍ. الرابط صالح 30 دقيقة.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-black text-3xl mb-2 leading-tight">
            إعادة تعيين كلمة المرور
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            بنرسل لك رابطاً سرّياً على بريدك.
          </p>
        </div>
        <ForgotForm />
        <p className="text-center text-xs text-[var(--text-muted)]">
          تذكّرتها؟{" "}
          <Link href="/login" className="text-[var(--brand)] font-semibold hover:underline">
            ادخل
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
