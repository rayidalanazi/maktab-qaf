import Link from "next/link";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { TenantControls } from "@/components/admin/TenantControls";
import { ADMIN_TENANTS } from "@/data/admin-mock";

const STATUS_COLOR: Record<string, string> = {
  "نشط": "var(--success)",
  "تجربة": "var(--info)",
  "متأخر دفع": "var(--accent)",
  "موقوف": "var(--text-faint)",
};

export default function AdminTenantsPage() {
  return (
    <>
      <Topbar title="المكاتب" sub="كل العملاء" breadcrumb={["Admin", "المكاتب"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="المكاتب المشتركة"
          sub={`${ADMIN_TENANTS.length} مكتب`}
          actions={
            <>
              <button className="btn btn-ghost text-sm py-2.5">📥 تصدير CSV</button>
              <button className="btn btn-brand text-sm py-2.5">+ إضافة يدوية</button>
            </>
          }
        />

        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] bg-[var(--bg-hover)] border-b border-[var(--border)]">
              <tr>
                <th className="text-right p-3">المكتب</th>
                <th className="text-right p-3">النطاق</th>
                <th className="text-right p-3">الباقة</th>
                <th className="text-right p-3">MRR</th>
                <th className="text-right p-3">المستخدمون</th>
                <th className="text-right p-3">الحالة</th>
                <th className="text-right p-3">آخر نشاط</th>
                <th className="text-right p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {ADMIN_TENANTS.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-[10px] text-[var(--text-faint)] font-mono">منذ {t.signedUp}</div>
                  </td>
                  <td className="p-3 text-xs font-mono text-[var(--text-muted)]" dir="ltr">
                    {t.slug}.qaf.sa
                  </td>
                  <td className="p-3 text-xs">{t.plan}</td>
                  <td className="p-3 text-xs font-mono num">
                    {t.mrr > 0 ? `${t.mrr} ر.س` : "—"}
                  </td>
                  <td className="p-3 text-xs num">{t.users}</td>
                  <td className="p-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{
                        background: `color-mix(in srgb, ${STATUS_COLOR[t.status]} 15%, transparent)`,
                        color: STATUS_COLOR[t.status],
                      }}
                    >
                      ● {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-[var(--text-muted)]">{t.lastActive}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/admin/tenants/${t.slug}`}
                        className="text-[11px] text-[var(--brand)] hover:underline whitespace-nowrap"
                      >
                        التفاصيل
                      </Link>
                      <TenantControls tenantSlug={t.slug} tenantName={t.name} status={t.status} variant="compact" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
