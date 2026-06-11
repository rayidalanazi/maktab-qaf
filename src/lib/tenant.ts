/**
 * Tenant resolution helpers — used in Server Components / Server Actions.
 *
 * Strategy:
 *   1. Read `x-tenant-slug` header injected by proxy.ts (production / dev with subdomain)
 *   2. Fallback to ?tenant=raed query param (useful for GitHub Pages static preview)
 *   3. Returns null for the marketing site (no tenant context)
 *
 * Real DB lookup of (slug → tenant_id, plan, enabled_addons) happens in
 * `loadTenantBySlug` once Supabase is wired.
 */

import { headers } from "next/headers";

export interface TenantContext {
  slug: string;
  // Populated from DB lookup once Supabase is connected
  id?: string;
  name?: string;
  plan?: string;
  enabledAddons?: string[];
}

/**
 * Server-side: read the tenant slug from request headers or URL.
 * Pass the searchParams from a page to enable ?tenant= fallback for static export.
 */
export async function getTenantSlug(
  searchParams?: Record<string, string | string[] | undefined>,
): Promise<string | null> {
  try {
    const h = await headers();
    const sub = h.get("x-tenant-slug");
    if (sub) return sub;
  } catch {
    // headers() throws in some contexts (static export) — fall back to searchParams
  }

  if (searchParams) {
    const t = searchParams.tenant;
    if (typeof t === "string" && t.length > 0) return t;
  }

  return null;
}

/**
 * Returns the full tenant context.
 *
 * For now we return a stub for known dev tenants. Once Supabase is wired,
 * this hits `tenants` table with `select * where slug = $1 and status='active'`.
 */
export async function loadTenantBySlug(slug: string): Promise<TenantContext | null> {
  // Every addon key referenced in the sidebar nav — used by the neutral "app"
  // workspace shell so a real firm (whose addons are resolved client-side from
  // its session) never sees a stripped nav during the static render.
  const ALL_ADDONS = [
    "core_cases", "case_timeline_plus", "memos_module", "templates_library",
    "precedents_engine", "regulations_hub", "schedule_attendance", "documents_vault",
    "requests_workflow", "invoicing_pro", "expenses_loans", "salaries_payroll",
    "reports_basic", "kpi_dashboard", "executive_suite",
  ];

  // TODO: replace with real Supabase query
  const KNOWN_DEV_TENANTS: Record<string, Omit<TenantContext, "slug">> = {
    // Neutral signed-in workspace shell. The URL stays /t/app/ for ALL real
    // firms (static hosting can't pre-build a page per firm); the actual firm
    // name + subdomain come from the session (see Sidebar/SessionProvider).
    app: {
      id: "app-shell",
      name: "مكتبك",
      plan: "bundle_medium",
      enabledAddons: ALL_ADDONS,
    },
    raed: {
      id: "dev-tenant-raed",
      name: "شركة رائد للمحاماة",
      plan: "bundle_medium",
      enabledAddons: [
        "core_cases", "case_timeline_plus", "memos_module", "templates_library",
        "schedule_attendance", "documents_vault", "invoicing_pro", "reports_basic",
      ],
    },
    alfaisal: {
      id: "dev-tenant-alfaisal",
      name: "مكتب الفيصل للمحاماة",
      plan: "bundle_small",
      enabledAddons: ["core_cases", "schedule_attendance", "documents_vault"],
    },
  };

  const ctx = KNOWN_DEV_TENANTS[slug];
  if (ctx) return { slug, ...ctx };

  // On a SERVER runtime (Vercel / Docker / OVH) any tenant subdomain or path
  // must render — e.g. meeem.qaf.sa → /t/meeem. The real firm name + plan are
  // resolved client-side from the session; here we return a neutral base-tier
  // placeholder so the page renders instead of 404. (On the static GitHub Pages
  // build only the generateStaticParams slugs exist, so this branch is unused
  // there.)
  return {
    slug,
    name: slug,
    plan: "bundle_base",
    enabledAddons: ["core_cases", "schedule_attendance", "documents_vault"],
  };
}

/**
 * Convenience for pages that need the whole context.
 */
export async function getTenant(
  searchParams?: Record<string, string | string[] | undefined>,
): Promise<TenantContext | null> {
  const slug = await getTenantSlug(searchParams);
  if (!slug) return null;
  return loadTenantBySlug(slug);
}

/**
 * Check if a tenant has a specific addon enabled.
 * Used everywhere — sidebar nav filtering, page-level gates, server-action guards.
 */
export function hasAddon(tenant: TenantContext | null, addonKey: string): boolean {
  if (!tenant) return false;
  return tenant.enabledAddons?.includes(addonKey) ?? false;
}
