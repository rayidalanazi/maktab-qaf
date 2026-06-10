/**
 * Next.js 16 PROXY (renamed from middleware.ts in Next 16).
 * Runs on every request, on the Node.js runtime ONLY (edge is unsupported in proxy).
 *
 * Job:
 *   1. Detect tenant subdomain (raed.qaf.sa → tenantSlug = "raed")
 *   2. Inject x-tenant-slug header for downstream Server Components / Server Actions
 *   3. Reserved subdomains (api, admin, app, mail, www) are NOT tenants:
 *        - admin.qaf.sa  → routed to the platform admin app
 *        - www.qaf.sa    → the marketing site (treated as no-tenant)
 *        - anything else → treated as marketing site (no x-tenant-slug)
 *   4. Static-export builds (GitHub Pages) skip this entirely — proxy.ts only runs at runtime.
 *
 * IMPORTANT: do NOT rely on proxy alone for authn/authz.
 *   Re-verify session + tenant in every Server Action.
 */

import { NextResponse, type NextRequest } from "next/server";

const RESERVED_SUBDOMAINS = new Set([
  "www", "api", "admin", "app", "mail", "ftp",
  "smtp", "imap", "ns1", "ns2", "qaf",
]);

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "qaf.sa";

/**
 * Extract the leftmost label from a host that ends with our base domain.
 * Returns:
 *   "raed.qaf.sa"  → "raed"
 *   "qaf.sa"       → null
 *   "www.qaf.sa"   → "www" (caller decides what to do with reserved labels)
 *   "localhost:3000" → null (dev)
 *   "raed.localhost:3000" → "raed" (dev subdomain pattern)
 */
function extractSubdomain(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  const host = hostHeader.toLowerCase().split(":")[0];

  // Dev: foo.localhost
  if (host.endsWith(".localhost")) {
    const sub = host.slice(0, -".localhost".length);
    return sub || null;
  }
  if (host === "localhost") return null;

  // Production: foo.qaf.sa
  if (host === BASE_DOMAIN) return null;
  if (host.endsWith("." + BASE_DOMAIN)) {
    const sub = host.slice(0, -("." + BASE_DOMAIN).length);
    // Multi-level subdomain (a.b.qaf.sa) — take leftmost
    return sub.split(".")[0] || null;
  }

  // Custom domain (later) — for now treat as no-tenant; will be looked up
  // server-side via a tenants.custom_domain table query.
  return null;
}

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostHeader = req.headers.get("host");
  const sub = extractSubdomain(hostHeader);

  const requestHeaders = new Headers(req.headers);

  if (sub) {
    if (RESERVED_SUBDOMAINS.has(sub)) {
      if (sub === "admin") {
        // Route admin.qaf.sa → /admin/* internally
        if (!url.pathname.startsWith("/admin")) {
          url.pathname = "/admin" + url.pathname;
          return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
        }
      }
      // www / api / etc → marketing pages, no tenant
    } else {
      // Tenant subdomain — inject slug + internally rewrite raed.qaf.sa/dashboard
      // into /t/raed/dashboard so we can group all tenant pages under app/t/[tenant]/.
      // The URL bar still shows raed.qaf.sa/dashboard.
      requestHeaders.set("x-tenant-slug", sub);
      if (!url.pathname.startsWith(`/t/${sub}`) && !url.pathname.startsWith("/_next")) {
        url.pathname = `/t/${sub}${url.pathname === "/" ? "" : url.pathname}`;
        return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
      }
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     *   - _next/static (assets)
     *   - _next/image
     *   - favicon.ico, robots.txt, sitemap.xml
     *   - /api/health (Docker / Traefik probe — runs without tenant)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|api/health).*)",
  ],
};
