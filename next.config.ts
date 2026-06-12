import type { NextConfig } from "next";

/**
 * Dual-mode build:
 *   - default: standalone server (used by Docker → OVH VPS in prod)
 *   - STATIC_EXPORT=1: static HTML export (used by GitHub Pages for mobile preview)
 *
 * In static export mode:
 *   - basePath = /maktab-qaf (gh-pages project URL)
 *   - API routes (src/app/api/*) are stripped by the CI workflow before build
 *   - headers() is omitted entirely (export ignores them and the GitHub runner is noisy about it)
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_BASE_PATH || (isStaticExport ? "/maktab-qaf" : "");

const baseConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,

  reactStrictMode: true,
  compress: true,

  trailingSlash: isStaticExport,

  images: isStaticExport
    ? { unoptimized: true }
    : {
        remotePatterns: [
          { protocol: "https", hostname: "*.supabase.co" },
          { protocol: "https", hostname: "*.qaf.sa" },
        ],
      },
};

const serverOnlyConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // geolocation MUST allow self — the attendance check-in (getCurrentPosition /
          // watchPosition) needs it; an empty allowlist geolocation=() blocks all origins.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

const nextConfig: NextConfig = isStaticExport
  ? baseConfig
  : { ...baseConfig, ...serverOnlyConfig };

export default nextConfig;
