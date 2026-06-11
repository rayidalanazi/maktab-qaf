"use client";

import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useAdminData } from "@/hooks/useAdminData";
import { fetchAdminTenants } from "@/lib/data/queries";
import type { AdminTenantRow } from "@/lib/data/types";
import { ADMIN_TENANTS } from "@/data/admin-mock";
import { getBundle } from "@/data/pricing";

// Demo fallback — admin-mock tenants reshaped into the live row shape.
const FALLBACK_TENANTS: AdminTenantRow[] = ADMIN_TENANTS.map((t) => ({
  id: String(t.id),
  slug: t.slug,
  name: t.name,
  plan: t.plan,
  status: t.status === "نشط" ? "active" : t.status === "تجربة" ? "trialing" : "past_due",
  enabledAddons: [],
  trialEndsAt: null,
  createdAt: t.signedUp,
}));

// ── Mock data ────────────────────────────────────────────────────────────────

const CHURN_REASONS = [
  { reason: "السعر مرتفع", pct: 38, color: "var(--danger)" },
  { reason: "قلة الاستخدام", pct: 27, color: "var(--warn)" },
  { reason: "انتقل لمنافس", pct: 18, color: "var(--accent)" },
  { reason: "أغلق المكتب", pct: 11, color: "var(--info)" },
  { reason: "أخرى", pct: 6, color: "var(--text-faint)" },
];

type RiskLevel = "عالٍ" | "متوسط" | "منخفض";

const AT_RISK = [
  {
    firm: "مكتب القحطاني للمحاماة",
    plan: "النخبة",
    reason: "لم يدخل 14 يوم",
    mrr: 1200,
    level: "عالٍ" as RiskLevel,
    action: "اتصال هاتفي من النجاح + عرض جلسة تدريب",
  },
  {
    firm: "مكتب الخوري",
    plan: "الأعمال",
    reason: "دفعة متأخرة",
    mrr: 890,
    level: "عالٍ" as RiskLevel,
    action: "تسوية الفاتورة + تفعيل التذكير الآلي",
  },
  {
    firm: "مؤسسة العتيبي القانونية",
    plan: "الأعمال",
    reason: "استخدام منخفض",
    mrr: 750,
    level: "متوسط" as RiskLevel,
    action: "حملة بريد إعادة تنشيط + ميزات مقترحة",
  },
  {
    firm: "مكتب المطيري",
    plan: "الأساسية",
    reason: "لم يدخل 14 يوم",
    mrr: 420,
    level: "متوسط" as RiskLevel,
    action: "رسالة واتساب تذكيرية من فريق النجاح",
  },
  {
    firm: "مكتب الشمري للاستشارات",
    plan: "الأساسية",
    reason: "استخدام منخفض",
    mrr: 380,
    level: "منخفض" as RiskLevel,
    action: "إدراج ضمن نشرة أفضل الممارسات",
  },
];

const RISK_COLOR: Record<RiskLevel, string> = {
  "عالٍ": "var(--danger)",
  "متوسط": "var(--warn)",
  "منخفض": "var(--info)",
};

const REASON_COLOR: Record<string, string> = {
  "لم يدخل 14 يوم": "var(--danger)",
  "دفعة متأخرة": "var(--warn)",
  "استخدام منخفض": "var(--accent)",
  "حساب موقوف": "var(--danger)",
  "ألغى الاشتراك": "var(--accent)",
};

// In LIVE mode, at-risk rows are derived from tenant status.
const STATUS_RISK: Record<string, { reason: string; level: RiskLevel; action: string }> = {
  past_due: { reason: "دفعة متأخرة", level: "عالٍ", action: "تسوية الفاتورة + تفعيل التذكير الآلي" },
  suspended: { reason: "حساب موقوف", level: "عالٍ", action: "تواصل مباشر من فريق النجاح لإعادة التفعيل" },
  cancelled: { reason: "ألغى الاشتراك", level: "متوسط", action: "مقابلة خروج + عرض استرجاع مخصّص" },
};

// ──────────────────────────────────────────────────────────────────────────────

export default function AdminChurnPage() {
  const { data: tenants, isLive } = useAdminData(fetchAdminTenants, FALLBACK_TENANTS);

  const atRisk = isLive
    ? tenants
        .filter((t) => t.status in STATUS_RISK)
        .map((t) => {
          const meta = STATUS_RISK[t.status];
          const bundle = getBundle(t.plan);
          return {
            firm: t.name,
            plan: bundle?.name_ar ?? t.plan,
            reason: meta.reason,
            mrr: bundle?.price_monthly_sar ?? 0,
            level: meta.level,
            action: meta.action,
          };
        })
    : AT_RISK;

  const exposedMRR = atRisk.reduce((s, f) => s + f.mrr, 0);

  const gone = tenants.filter((t) => t.status === "cancelled" || t.status === "suspended");
  const churnRate = isLive
    ? `${tenants.length ? ((gone.length / tenants.length) * 100).toFixed(1) : "0.0"}%`
    : "2.8%";
  const retentionRate = isLive
    ? `${tenants.length ? (100 - (gone.length / tenants.length) * 100).toFixed(1) : "100.0"}%`
    : "97.2%";
  const lostRevenue = isLive
    ? gone.reduce((s, t) => s + (getBundle(t.plan)?.price_monthly_sar ?? 0), 0).toLocaleString()
    : "6,420";

  return (
    <>
      <Topbar title="التغبّن والاحتفاظ" breadcrumb={["Admin", "التغبّن"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="التغبّن والاحتفاظ"
          sub="// راقب التسرّب قبل ما يصير نزيف"
          actions={<button className="btn btn-ghost text-sm py-2.5">📥 تصدير</button>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard
            label="معدل التغبّن الشهري"
            value={churnRate}
            icon="📉"
            accent="warn"
            trend={{ v: "0.4%", up: false }}
            hint="مقارنة بالشهر السابق"
          />
          <StatCard
            label="الإيراد المفقود"
            value={lostRevenue}
            icon="💸"
            accent="brand"
            hint="ر.س / آخر 30 يوماً"
          />
          <StatCard
            label="LTV"
            value="14,800"
            icon="💎"
            accent="info"
            hint="ر.س / متوسط عمر المكتب"
          />
          <StatCard
            label="معدل الاحتفاظ"
            value={retentionRate}
            icon="🛡️"
            accent="success"
            trend={{ v: "0.4%", up: true }}
            hint="آخر 90 يوماً"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-5">
          {/* Cancellation reasons — horizontal bar chart */}
          <div className="card">
            <div className="font-bold mb-1">أسباب الإلغاء</div>
            <div className="text-[11px] text-[var(--text-faint)] mb-4">
              توزيع المكاتب الملغية — آخر 90 يوماً
            </div>
            <div className="space-y-3">
              {CHURN_REASONS.map((r) => (
                <div key={r.reason}>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-bold">{r.reason}</span>
                    <span className="num font-mono text-[var(--text-muted)]" dir="ltr">
                      {r.pct}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${r.pct}%`, background: r.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retention insight summary */}
          <div className="card flex flex-col">
            <div className="font-bold mb-1">قراءة سريعة</div>
            <div className="text-[11px] text-[var(--text-faint)] mb-4">
              مؤشرات الاحتفاظ التشغيلية
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--bg-hover)]">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">مكاتب معرّضة</div>
                <div className="num font-display font-black text-2xl text-[var(--danger)]" dir="ltr">
                  {atRisk.length}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-hover)]">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">MRR معرّض</div>
                <div className="num font-display font-black text-2xl text-[var(--warn)]" dir="ltr">
                  {exposedMRR.toLocaleString()}
                </div>
                <div className="text-[10px] text-[var(--text-faint)]">ر.س / شهر</div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-hover)]">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">إعادة تفعيل</div>
                <div className="num font-display font-black text-2xl text-[var(--success)]" dir="ltr">
                  41%
                </div>
                <div className="text-[10px] text-[var(--text-faint)]">من المعرّضين</div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-hover)]">
                <div className="text-[11px] text-[var(--text-muted)] mb-1">متوسط العمر</div>
                <div className="num font-display font-black text-2xl text-[var(--info)]" dir="ltr">
                  22
                </div>
                <div className="text-[10px] text-[var(--text-faint)]">شهراً</div>
              </div>
            </div>
            <div className="mt-auto pt-4 text-[11px] text-[var(--text-muted)] leading-relaxed">
              السعر هو السبب الأبرز للإلغاء (38%). التركيز على المكاتب التي لم
              تسجّل دخولاً منذ 14 يوماً يحمي{" "}
              <span className="num font-mono text-[var(--text)]" dir="ltr">
                {atRisk.filter((f) => f.reason === "لم يدخل 14 يوم")
                  .reduce((s, f) => s + f.mrr, 0)
                  .toLocaleString()}
              </span>{" "}
              ر.س من الإيراد الشهري.
            </div>
          </div>
        </div>

        {/* At-risk firms table */}
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold">مكاتب معرّضة للخطر</div>
          <span className="text-[11px] text-[var(--text-faint)] num" dir="ltr">
            {atRisk.length} مكاتب
          </span>
        </div>
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="text-right text-[11px] text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="font-medium px-4 py-3">المكتب</th>
                <th className="font-medium px-4 py-3">السبب</th>
                <th className="font-medium px-4 py-3">MRR معرّض</th>
                <th className="font-medium px-4 py-3">مستوى الخطر</th>
                <th className="font-medium px-4 py-3">الإجراء المقترح</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map((f) => (
                <tr
                  key={f.firm}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-[var(--text)]">{f.firm}</div>
                    <div className="text-[10px] text-[var(--text-faint)]">{f.plan}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: `color-mix(in srgb, ${REASON_COLOR[f.reason]} 15%, transparent)`,
                        color: REASON_COLOR[f.reason],
                      }}
                    >
                      {f.reason}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="num font-mono font-bold text-[var(--text)]" dir="ltr">
                      {f.mrr.toLocaleString()}
                    </span>{" "}
                    <span className="text-[10px] text-[var(--text-faint)]">ر.س</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: `color-mix(in srgb, ${RISK_COLOR[f.level]} 15%, transparent)`,
                        color: RISK_COLOR[f.level],
                      }}
                    >
                      {f.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{f.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
