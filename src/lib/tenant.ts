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
  // TODO: replace with real Supabase query
  const KNOWN_DEV_TENANTS: Record<string, Omit<TenantContext, "slug">> = {
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
  if (!ctx) return null;
  return { slug, ...ctx };
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
