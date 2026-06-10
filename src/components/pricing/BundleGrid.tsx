import Link from "next/link";
import { BUNDLES, getAddon } from "@/data/pricing";
import { verifyBundleSavings } from "@/lib/pricing-calc";

export function BundleGrid() {
  return (
    <section id="bundles" className="py-20 border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="pill mb-4">الباقات</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4 leading-tight">
            أربع باقات. واحدة
            <br />
            <span className="text-gradient-brand">تناسب حجم مكتبك.</span>
          </h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            من المحامي المستقل إلى المكاتب الكبيرة. اختر اللي يلائم حجمك، وكبّر لما تجي الحاجة.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {BUNDLES.map((b) => {
            const audit = verifyBundleSavings(b.key);
            const popularAddons = b.included_addon_keys
              .slice(0, 5)
              .map((k) => getAddon(k))
              .filter(Boolean);
            const moreCount = Math.max(0, b.included_addon_keys.length - popularAddons.length);

            return (
              <div
                key={b.key}
                className={`card flex flex-col relative ${
                  b.is_recommended
                    ? "border-[var(--brand)] bg-gradient-to-b from-[var(--brand)]/8 to-transparent shadow-2xl scale-[1.02]"
                    : ""
                }`}
              >
                {b.is_recommended && (
                  <div className="absolute -top-3 right-4 text-[10px] font-bold bg-[var(--brand)] text-black px-3 py-1 rounded-full">
                    🔥 الأكثر طلباً
                  </div>
                )}

                <div className="mb-4">
                  <div className="font-display font-bold text-xl mb-1">{b.name_ar}</div>
                  <div className="text-xs text-[var(--text-faint)] leading-relaxed">
                    {b.tagline_ar}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="font-black text-4xl num">{b.price_monthly_sar}</span>
                    <span className="text-[var(--text-muted)] text-sm">ر.س</span>
                    <span className="text-[var(--text-faint)] text-xs">/شهر</span>
                  </div>
                  {b.savings_vs_individual_sar > 0 && (
                    <div className="text-xs text-[var(--brand)] font-mono">
                      توفّر ~{b.savings_vs_individual_sar} ر.س/شهر مقابل الشراء المنفصل
                    </div>
                  )}
                </div>

                <div className="text-xs bg-[var(--bg-hover)] rounded-lg px-3 py-2 mb-4 border border-[var(--border)]">
                  <div className="text-[var(--text-muted)] mb-0.5">👥 المقاعد:</div>
                  <div className="font-semibold">{b.user_seats}</div>
                  <div className="text-[var(--text-faint)] text-[10px] mt-1">
                    مستخدم إضافي: 39 ر.س/شهر
                  </div>
                </div>

                <div className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed flex-1">
                  {b.target_audience_ar}
                </div>

                <div className="mb-4 text-xs">
                  <div className="text-[var(--text-faint)] mb-2 font-mono">
                    // يشمل {b.included_addon_keys.length} ميزة:
                  </div>
                  <ul className="space-y-1.5">
                    {popularAddons.map(
                      (a) =>
                        a && (
                          <li key={a.key} className="flex items-start gap-2">
                            <span className="text-[var(--brand)] mt-0.5 shrink-0">✓</span>
                            <span className="text-[var(--text-muted)]">{a.name_ar}</span>
                          </li>
                        ),
                    )}
                    {moreCount > 0 && (
                      <li className="flex items-start gap-2 pt-1">
                        <span className="text-[var(--text-faint)] mt-0.5">+</span>
                        <span className="text-[var(--text-faint)]">
                          و {moreCount} ميزة أخرى
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                <Link
                  href={`/signup?bundle=${b.key}`}
                  className={`btn w-full ${b.is_recommended ? "btn-brand" : "btn-ghost"}`}
                >
                  {b.key === "bundle_enterprise" ? "احجز عرضاً" : "ابدأ تجربة مجاناً"}
                </Link>

                {process.env.NODE_ENV === "development" && !audit.match && (
                  <div className="mt-2 text-[9px] text-[var(--accent)] font-mono">
                    [dev] math mismatch: claimed {audit.claimed}, computed {audit.computed}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
