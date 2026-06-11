"use client";

import { useParams } from "next/navigation";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { ThemePickerPanel } from "@/components/theme/ThemeSwitcher";
import { useSession } from "@/components/app/SessionProvider";
import { BUNDLES } from "@/data/pricing";

type SettingItem = {
  k: string;
  v: string;
  ltr?: boolean;
  brand?: boolean;
  success?: boolean;
  muted?: boolean;
};

function planLabel(plan: string): string {
  const b = BUNDLES.find((x) => x.key === plan);
  return b ? `${b.name_ar} — ${b.price_monthly_sar} ر.س/شهر` : plan;
}

export default function SettingsPage() {
  const params = useParams<{ tenant: string }>();
  const slug = params?.tenant ?? "raed";
  const { tenant, profile, isReal } = useSession();

  const real = isReal && tenant ? tenant : null;
  const addonsCount = real ? (real.enabled_addons ?? []).length : 0;

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: "معلومات المكتب",
      items: [
        { k: "اسم المكتب", v: real ? real.name : "شركة رائد للمحاماة" },
        { k: "النطاق", v: `${real ? real.slug : slug}.qaf.sa`, ltr: true },
        { k: "البريد", v: real ? (profile?.email ?? "—") : "admin@raed-law.sa", ltr: true },
        real
          ? { k: "مدير الحساب", v: profile?.full_name ?? "—" }
          : { k: "الجوال", v: "+966 50 123 4567", ltr: true },
      ],
    },
    {
      title: "الباقة والفوترة",
      items: [
        {
          k: "الباقة الحالية",
          v: real ? planLabel(real.plan) : "متوسط — 499 ر.س/شهر",
          brand: true,
        },
        real
          ? { k: "الإضافات المفعّلة", v: `${addonsCount} إضافة` }
          : { k: "المقاعد", v: "10/10 مستخدم + سكرتارية مجاناً" },
        { k: "تاريخ التجديد القادم", v: "2026-07-10", ltr: true },
        { k: "طريقة الدفع", v: "•••• 4242 (Visa)", ltr: true },
      ],
    },
    {
      title: "الأمان",
      items: [
        { k: "المصادقة الثنائية (2FA)", v: "مفعّلة (TOTP)", success: true },
        { k: "تسجيل دخول نفاذ", v: "غير مفعّل — أضف بـ 39 ر.س/شهر", muted: true },
        { k: "سجل التدقيق", v: "آخر تحديث: قبل ساعتين" },
        { k: "تصدير البيانات", v: "متاح — CSV + PDF" },
      ],
    },
  ];

  return (
    <>
      <Topbar title="الإعدادات" breadcrumb={["الرئيسية", "الإعدادات"]} />
      <main className="p-4 sm:p-6 max-w-4xl w-full">
        <PageHeader
          title="إعدادات المكتب"
          sub="إدارة معلومات المكتب والباقة والأمان"
        />

        <div className="space-y-5">
          {/* Appearance — theme + mode picker */}
          <div className="card">
            <h3 className="font-bold mb-1 flex items-center gap-2">
              🎨 المظهر
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              اختر الوضع واللون اللي يريّح عينك — يُحفظ تلقائياً على جهازك.
            </p>
            <ThemePickerPanel />
          </div>

          {sections.map((sec, i) => (
            <div key={i} className="card">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                {sec.title}
              </h3>
              <div className="space-y-3">
                {sec.items.map((item, j) => (
                  <div
                    key={j}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-[var(--border)] last:border-0"
                  >
                    <div className="text-sm text-[var(--text-muted)]">{item.k}</div>
                    <div
                      className={`text-sm font-semibold ${
                        item.brand ? "text-[var(--brand)]" :
                        item.success ? "text-[var(--success)]" :
                        item.muted ? "text-[var(--text-muted)]" : ""
                      } ${item.ltr ? "font-mono" : ""}`}
                      dir={item.ltr ? "ltr" : undefined}
                    >
                      {item.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="card border-[var(--accent)]/30 bg-[var(--accent)]/5">
            <h3 className="font-bold mb-2 text-[var(--accent)]">// منطقة حسّاسة</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              إلغاء الاشتراك يحفظ بياناتك 90 يوماً قابلة للتصدير، ثم تُحذف نهائياً.
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-ghost text-xs py-2 border-[var(--accent)]/30">
                إلغاء الاشتراك
              </button>
              <button className="btn btn-ghost text-xs py-2 border-[var(--accent)]/30">
                تصدير كل البيانات
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
