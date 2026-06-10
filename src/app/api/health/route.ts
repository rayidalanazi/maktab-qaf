/**
 * Health check endpoint for Docker + Traefik + uptime monitoring.
 * Returns 200 OK when the server is healthy.
 *
 * Later: when Supabase is connected, this also pings the DB.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "qaf",
      timestamp: new Date().toISOString(),
      uptime: typeof process !== "undefined" ? Math.floor(process.uptime()) : null,
    },
    {
      status: 200,
      headers: { "cache-control": "no-store, max-age=0" },
    },
  );
}
