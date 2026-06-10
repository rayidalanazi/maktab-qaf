interface Props {
  firmNameAr: string;
  subdomain: string;
  baseDomain?: string;
}

export function SuccessStep({ firmNameAr, subdomain, baseDomain = "qaf.sa" }: Props) {
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

      <a
        href={`https://${subdomain}.${baseDomain}/dashboard`}
        className="btn btn-brand w-full py-3.5"
      >
        افتح لوحة التحكم
        <span className="arrow-flip">→</span>
      </a>
      <p className="text-[10px] text-[var(--text-faint)] font-mono mt-3">
        // ستوجَّه تلقائياً خلال 3 ثوانٍ
      </p>
    </div>
  );
}
