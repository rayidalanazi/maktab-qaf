import { notFound } from "next/navigation";
import { TenantDetailClient } from "@/components/admin/TenantDetailClient";
import {
  ADMIN_TENANTS,
  ADMIN_USERS,
  ADMIN_GRANTS,
  ADMIN_TENANT_ADDONS,
  ADMIN_TENANT_ACTIVITY,
} from "@/data/admin-mock";

export function generateStaticParams() {
  return ADMIN_TENANTS.map((t) => ({ slug: t.slug }));
}

export default async function AdminTenantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = ADMIN_TENANTS.find((t) => t.slug === slug);
  if (!tenant) notFound();

  const users = ADMIN_USERS.filter((u) => u.tenantSlug === slug);
  const grants = ADMIN_GRANTS.filter((g) => g.tenantSlug === slug);
  const addonKeys = ADMIN_TENANT_ADDONS[slug] || [];
  const activity = ADMIN_TENANT_ACTIVITY[slug] || [
    { ts: tenant.lastActive, text: "آخر دخول للمكتب", ic: "🔑" },
    { ts: `منذ ${tenant.signedUp}`, text: "إنشاء حساب المكتب", ic: "🎉" },
  ];

  return (
    <TenantDetailClient
      tenant={tenant}
      users={users}
      addonKeys={addonKeys}
      grants={grants}
      activity={activity}
    />
  );
}
