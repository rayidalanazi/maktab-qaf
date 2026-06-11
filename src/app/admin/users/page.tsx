"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { UserActions } from "@/components/admin/UserActions";
import { useAdminData } from "@/hooks/useAdminData";
import { fetchAdminTenants, fetchAdminUsers, setUserStatus } from "@/lib/data/queries";
import type { AdminTenantRow, AdminUserRow } from "@/lib/data/types";
import { ADMIN_USERS, ADMIN_TENANTS } from "@/data/admin-mock";

const STATUS_COLOR: Record<string, string> = {
  "نشط": "var(--success)",
  "معطل": "var(--text-faint)",
  "مدعو": "var(--info)",
};

/* English row keys (live data) → Arabic labels. Mock rows already carry
   Arabic labels and pass through the `?? fallback` untouched. */
const STATUS_AR: Record<string, string> = {
  active: "نشط",
  suspended: "معطل",
  disabled: "معطل",
  invited: "مدعو",
};

const ROLE_AR: Record<string, string> = {
  admin: "مدير النظام",
  general_manager: "مدير عام",
  partner: "شريك",
  manager: "مدير القضايا",
  lawyer: "محامي",
  consultant: "مستشار",
  accountant: "محاسب",
  marketer: "مسوّق",
  auditor: "مدقق",
  secretary: "سكرتارية",
};

type UserRow = AdminUserRow & { mfa?: boolean };

/* Demo fallback — the existing mock reshaped into the live row shape.
   tenantId carries the slug; the join below resolves by id OR slug. */
const FALLBACK_USERS: UserRow[] = ADMIN_USERS.map((u) => ({
  id: String(u.id),
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status,
  tenantId: u.tenantSlug,
  lastSeen: u.lastLogin,
  createdAt: u.createdAt,
  mfa: u.mfa,
}));

const FALLBACK_TENANTS: AdminTenantRow[] = ADMIN_TENANTS.map((t) => ({
  id: String(t.id),
  slug: t.slug,
  name: t.name,
  plan: t.plan,
  status: t.status,
  enabledAddons: [],
  trialEndsAt: null,
  createdAt: t.signedUp,
}));

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [tenant, setTenant] = useState("");
  const [role, setRole] = useState("");

  const { data: userRows, isLive, reload } = useAdminData<UserRow>(fetchAdminUsers, FALLBACK_USERS);
  const { data: tenants } = useAdminData(fetchAdminTenants, FALLBACK_TENANTS);

  const users = useMemo(() => {
    const tenantByKey = new Map<string, AdminTenantRow>();
    for (const t of tenants) {
      tenantByKey.set(t.id, t);
      tenantByKey.set(t.slug, t);
    }
    return userRows.map((u) => {
      const t = u.tenantId ? tenantByKey.get(u.tenantId) : undefined;
      return {
        ...u,
        role: ROLE_AR[u.role] ?? u.role,
        status: STATUS_AR[u.status] ?? u.status,
        tenantSlug: t?.slug ?? "",
        tenantName: t?.name ?? "—",
      };
    });
  }, [userRows, tenants]);

  const roles = useMemo(() => Array.from(new Set(users.map((u) => u.role))), [users]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((u) => {
      if (term && !(`${u.name} ${u.email} ${u.tenantName}`.toLowerCase().includes(term))) return false;
      if (tenant && u.tenantSlug !== tenant) return false;
      if (role && u.role !== role) return false;
      return true;
    });
  }, [users, q, tenant, role]);

  const active = users.filter((u) => u.status === "نشط").length;
  const withMfa = users.filter((u) => u.mfa).length;
  const mfaPct = users.length ? Math.round((withMfa / users.length) * 100) : 0;

  return (
    <>
      <Topbar title="كل المستخدمين" sub="عبر جميع المكاتب" breadcrumb={["Admin", "المستخدمون"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="كل المستخدمين"
          sub={`${users.length} مستخدم عبر ${tenants.length} مكتب`}
          actions={<button className="btn btn-ghost text-sm py-2.5">📥 تصدير CSV</button>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="إجمالي المستخدمين" value={users.length} icon="👥" accent="brand" />
          <StatCard label="نشطون" value={active} icon="✓" accent="success" />
          <StatCard label="مفعّل 2FA" value={`${mfaPct}%`} icon="🔐" accent="info" hint={`${withMfa} مستخدم`} />
          <StatCard label="المكاتب" value={tenants.length} icon="🏢" accent="accent" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث بالاسم أو الإيميل أو المكتب..."
              className="w-full ps-9 pe-3 py-2.5 text-sm rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)]"
            />
          </div>
          <select value={tenant} onChange={(e) => setTenant(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)]">
            <option value="">كل المكاتب</option>
            {tenants.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)]">
            <option value="">كل الأدوار</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] bg-[var(--bg-hover)] border-b border-[var(--border)]">
              <tr>
                <th className="text-right p-3">المستخدم</th>
                <th className="text-right p-3">المكتب</th>
                <th className="text-right p-3">الدور</th>
                <th className="text-right p-3">آخر دخول</th>
                <th className="text-right p-3">2FA</th>
                <th className="text-right p-3">الحالة</th>
                <th className="text-right p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--bg-hover)]">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-[var(--brand-deep)] text-black grid place-items-center font-bold text-[11px] shrink-0">
                        {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs">{u.name}</div>
                        <div className="text-[10px] text-[var(--text-faint)] font-mono truncate" dir="ltr">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/tenants/${u.tenantSlug}`} className="text-xs text-[var(--brand)] hover:underline">
                      {u.tenantName}
                    </Link>
                  </td>
                  <td className="p-3 text-xs text-[var(--text-muted)]">{u.role}</td>
                  <td className="p-3 text-xs text-[var(--text-faint)]">{u.lastSeen}</td>
                  <td className="p-3 text-xs">{u.mfa ? "🔐" : "—"}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: `color-mix(in srgb, ${STATUS_COLOR[u.status]} 15%, transparent)`, color: STATUS_COLOR[u.status] }}>
                      ● {u.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <UserActions
                      userName={u.name}
                      tenantName={u.tenantName}
                      status={u.status}
                      onSetStatus={isLive ? async (s) => { await setUserStatus(u.id, s); reload(); } : undefined}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-[var(--text-faint)]">
              // ما فيه مستخدم يطابق البحث
            </div>
          )}
        </div>
      </main>
    </>
  );
}
