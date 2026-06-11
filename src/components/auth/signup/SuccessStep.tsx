import Link from "next/link";

export type SuccessVariant = "created" | "confirm_email" | "existing";

interface Props {
  firmNameAr: string;
  subdomain: string;
  baseDomain?: string;
  /**
   * created       — firm provisioned, session live → straight to the app
   * confirm_email — auth user created but email confirmation pending → no session
   *                 yet; the firm is provisioned automatically on first login
   * existing      — the signed-in account already owns a firm → no new firm
   */
  variant?: SuccessVariant;
  email?: string;
  existingFirmName?: string;
}

const APP_HREF = "/t/raed";

export function SuccessStep({
  firmNameAr,
  subdomain,
  baseDomain = "qaf.sa",
  variant = "created",
  email,
  existingFirmName,
}: Props) {
  if (variant === "confirm_email") {
    return (
      <div className="text-center py-6">
        <div className="text-6xl mb-4 inline-block rounded-full p-4">📬</div>
        <h1 className="font-display font-black text-3xl mb-3">
          خطوة أخيرة — أكّد بريدك.
        </h1>
        <p className="text-[var(--text-muted)] mb-2 leading-relaxed">
          أرسلنا رابط تأكيد إلى{" "}
          <span className="font-mono text-[var(--brand)] text-sm" dir="ltr">{email}</span>
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
          اضغط الرابط في بريدك ثم سجّل دخولك —{" "}
          <span className="font-bold text-[var(--text)]">{firmNameAr}</span>{" "}
          سيُنشأ تلقائياً عند أول دخول على{" "}
          <span className="font-mono text-[var(--brand)] text-sm" dir="ltr">
            {subdomain}.{baseDomain}
          </span>
        </p>
        <div className="text-xs text-[var(--text-faint)] font-mono p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] mb-5">
          // ما وصلك شيء؟ شيّك مجلد السبام، أو جرّب الدخول بـ Google — أسرع وبدون تأكيد
        </div>
        <Link href="/login" className="btn btn-brand w-full py-3.5">
          إلى صفحة الدخول
          <span className="arrow-flip">→</span>
        </Link>
      </div>
    );
  }

  if (variant === "existing") {
    return (
      <div className="text-center py-6">
        <div className="text-6xl mb-4 inline-block rounded-full p-4">👋</div>
        <h1 className="font-display font-black text-3xl mb-3">
          عندك مكتب بالفعل.
        </h1>
        <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
          حسابك{email ? <span className="font-mono text-sm" dir="ltr"> {email} </span> : " "}
          مرتبط بمكتب{" "}
          <span className="font-bold text-[var(--text)]">{existingFirmName || "قائم"}</span>
          {" "}— كل حساب يدير مكتباً واحداً. لإنشاء مكتب جديد، سجّل خروجك أولاً
          وأنشئ حساباً جديداً بإيميل مختلف.
        </p>
        <Link href={APP_HREF} className="btn btn-brand w-full py-3.5">
          افتح مكتبك
          <span className="arrow-flip">→</span>
        </Link>
        <p className="text-[10px] text-[var(--text-faint)] font-mono mt-3">
          // ستوجَّه تلقائياً خلال 3 ثوانٍ
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <div className="text-6xl mb-4 animate-pulse-glow inline-block rounded-full p-4">
        ✓
      </div>
      <h1 className="font-display font-black text-3xl mb-3">
        تمام. مكتبك جاهز.
      </h1>
      <p className="text-[var(--text-muted)] mb-5 leading-relaxed">
        <span className="font-bold text-[var(--text)]">{firmNameAr}</span>{" "}
        على{" "}
        <span className="font-mono text-[var(--brand)] text-sm" dir="ltr">
          {subdomain}.{baseDomain}
        </span>
      </p>

      <div className="space-y-2 mb-6 text-right">
        <div className="text-xs font-mono text-[var(--text-faint)] mb-2 text-center">
          // ابدأ بثلاث خطوات سريعة:
        </div>
        {[
          { ic: "👥", t: "ادعُ فريقك", s: "المحامين والسكرتارية في دقيقة" },
          { ic: "🏷", t: "حمّل شعار المكتب", s: "يطلع على الفواتير والعقود" },
          { ic: "🧩", t: "تصفّح الإضافات", s: "نفاذ، واتساب، تقارير ذكية" },
        ].map((step, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]"
          >
            <span className="text-xl">{step.ic}</span>
            <div className="min-w-0">
              <div className="font-semibold text-sm">{step.t}</div>
              <div className="text-xs text-[var(--text-muted)]">{step.s}</div>
            </div>
          </div>
        ))}
      </div>

      <Link href={APP_HREF} className="btn btn-brand w-full py-3.5">
        افتح لوحة التحكم
        <span className="arrow-flip">→</span>
      </Link>
      <p className="text-[10px] text-[var(--text-faint)] font-mono mt-3">
        // ستوجَّه تلقائياً خلال 3 ثوانٍ
      </p>
    </div>
  );
}
