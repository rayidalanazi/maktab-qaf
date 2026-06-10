import { notFound } from "next/navigation";
import { loadTenantBySlug } from "@/lib/tenant";
import { Sidebar } from "@/components/app/Sidebar";
import { APP_NAV, filterNav } from "@/data/app-nav";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

export async function generateStaticParams() {
  // Pre-render the dev tenants for static export (GitHub Pages preview).
  return [{ tenant: "raed" }, { tenant: "alfaisal" }];
}

export default async function TenantLayout({ children, params }: LayoutProps) {
  const { tenant: slug } = await params;
  const tenant = await loadTenantBySlug(slug);
  if (!tenant) notFound();

  // Mocked current user — replaced by Supabase session lookup later.
  const currentUser = {
    name: "عبدالله العتيبي",
    role: "مدير النظام",
    role_key: "admin",
    initials: "عا",
  };

  const nav = filterNav(APP_NAV, tenant.enabledAddons || [], currentUser.role_key);
  const baseHref = `/t/${slug}`;

  return (
    <div className="grid lg:grid-cols-[288px_1fr] min-h-screen" dir="rtl">
      <Sidebar
        tenantName={tenant.name || slug}
        tenantSlug={slug}
        userName={currentUser.name}
        userRole={currentUser.role}
        userInitials={currentUser.initials}
        nav={nav}
        baseHref={baseHref}
      />
      <div className="min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
