import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { ADMIN_TENANTS, ADMIN_REVENUE_BY_MONTH } from "@/data/admin-mock";

export default function AdminRevenuePage() {
  const totalMRR = ADMIN_TENANTS.reduce((s, t) => s + t.mrr, 0);
  const arr = totalMRR * 12;
  const avgPerTenant = Math.round(totalMRR / ADMIN_TENANTS.filter((t) => !t.trial).length);

  const byPlan = ADMIN_TENANTS.reduce<Record<string, { count: number; mrr: number }>>((acc, t) => {
    const k = t.plan;
    acc[k] = acc[k] || { count: 0, mrr: 0 };
    acc[k].count += 1;
    acc[k].mrr += t.mrr;
    return acc;
  }, {});

  return (
    <>
      <Topbar title="الإيرادات" breadcrumb={["Admin", "الإيرادات"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader title="الإيرادات والمالية" sub="// الأرقام اللي توضح ما تشتغل عبثاً" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="MRR" value={`${totalMRR.toLocaleString()}`} icon="💰" accent="brand" hint="ر.س / شهر" />
          <StatCard label="ARR" value={`${(arr / 1000).toFixed(0)}K`} icon="📈" accent="success" hint="ر.س / سنة" />
          <StatCard label="معدّل كل مكتب" value={avgPerTenant} icon="🧮" accent="info" hint="ر.س / شهر" />
          <StatCard label="معدل تحويل التجربة" value="68%" icon="🎯" accent="warn" hint="آخر 90 يوماً" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* Revenue trend */}
          <div className="card">
            <div className="font-bold mb-4">MRR — آخر 6 أشهر</div>
            <div className="space-y-2">
              {ADMIN_REVENUE_BY_MONTH.map((m, i) => {
                const max = Math.max(...ADMIN_REVENUE_BY_MONTH.map((x) => x.mrr));
                const pct = (m.mrr / max) * 100;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-[10px] font-mono text-[var(--text-faint)] w-14" dir="ltr">
                      2026-{m.month}
                    </div>
                    <div className="flex-1 h-6 bg-[var(--bg-hover)] rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-[var(--brand)] to-[var(--brand-deep)] rounded flex items-center justify-end px-2 text-[10px] font-mono text-black font-bold"
                        style={{ width: `${pct}%` }}
                      >
                        {m.mrr.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By plan */}
          <div className="card">
            <div className="font-bold mb-4">توزيع الإيرادات حسب الباقة</div>
            <div className="space-y-3">
              {Object.entries(byPlan).map(([plan, data]) => {
                const pct = totalMRR > 0 ? (data.mrr / totalMRR) * 100 : 0;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <span className="font-bold">{plan}</span>
                      <span className="font-mono text-[var(--text-muted)]">
                        {data.count} مكتب • {data.mrr.toLocaleString()} ر.س
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--brand)] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tenant revenue contribution */}
        <div className="card">
          <div className="font-bold mb-4">أعلى المكاتب مساهمة بـ MRR</div>
          <div className="space-y-2">
            {[...ADMIN_TENANTS]
              .sort((a, b) => b.mrr - a.mrr)
              .slice(0, 5)
              .map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-hover)]">
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-[10px] text-[var(--text-faint)]">{t.plan} • {t.users} مستخدم</div>
                  </div>
                  <div className="font-mono font-bold num text-[var(--brand)]">{t.mrr} ر.س</div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </>
  );
}
