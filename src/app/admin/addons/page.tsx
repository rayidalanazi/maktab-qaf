import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { ADDONS, CATEGORIES } from "@/data/pricing";
import { ADMIN_TENANTS } from "@/data/admin-mock";

/**
 * Platform-admin view of every addon: who has it, revenue, adoption.
 */
export default function AdminAddonsPage() {
  const byCat = CATEGORIES.slice().sort((a, b) => a.order - b.order);

  // Fake adoption numbers derived deterministically so it looks alive.
  const adoption = (key: string) => {
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) % 97;
    return Math.max(1, Math.round((h / 97) * ADMIN_TENANTS.length));
  };

  return (
    <>
      <Topbar title="إدارة الإضافات" breadcrumb={["Admin", "الإضافات"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="إدارة الإضافات"
          sub={`${ADDONS.length} إضافة عبر ${CATEGORIES.length} فئة — فعّل أو عطّل لأي مكتب`}
        />

        <div className="space-y-6">
          {byCat.map((cat) => {
            const items = ADDONS.filter((a) => a.category === cat.key && a.price_monthly_sar > 0);
            if (!items.length) return null;
            return (
              <div key={cat.key}>
                <div className="flex items-center gap-2 mb-3">
                  <span>{cat.icon}</span>
                  <span className="font-bold text-sm">{cat.label_ar}</span>
                  <span className="text-[10px] text-[var(--text-faint)]">({items.length})</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((a) => {
                    const users = adoption(a.key);
                    const pct = Math.round((users / ADMIN_TENANTS.length) * 100);
                    return (
                      <div key={a.key} className="card">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-bold text-sm">{a.name_ar}</div>
                          <div className="font-mono text-[var(--brand)] text-xs num shrink-0">
                            {a.price_monthly_sar} ر.س
                          </div>
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-3">
                          {a.description_ar}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-faint)] mb-1.5">
                          <span>التبني: {users} مكتب</span>
                          <span className="num">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--brand)] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
