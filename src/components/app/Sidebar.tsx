"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/app/SessionProvider";
import { getSupabase } from "@/lib/supabase/client";
import type { NavSection } from "@/data/app-nav";

function initialsOf(name: string): string {
  const p = (name || "").trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")) || "؟";
}

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام", general_manager: "مدير عام",
  executive_director: "مدير تنفيذي", partner: "شريك", manager: "مدير القضايا",
  lawyer: "محامي", consultant: "مستشار قانوني", marketer: "مسوّق",
  auditor: "مدقّق قانوني", accountant: "محاسب", secretary: "سكرتير",
};

interface SidebarProps {
  tenantName: string;
  tenantSlug: string;
  userName: string;
  userRole: string;
  userInitials: string;
  nav: NavSection[];
  baseHref: string; // e.g. "/t/raed"
}

export function Sidebar({
  tenantName,
  tenantSlug,
  userName,
  userRole,
  userInitials,
  nav,
  baseHref,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { tenant, profile, isReal, isOperator } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prefer the real signed-in firm/user; fall back to the build-time props.
  const effTenantName = (isReal && tenant?.name) || tenantName;
  const effTenantSlug = (isReal && tenant?.slug) || tenantSlug;
  const effUserName = profile?.full_name || userName;
  const effUserRole =
    (profile?.role && ROLE_LABELS[profile.role]) || profile?.role || userRole;
  const effUserInitials =
    profile?.initials || (profile?.full_name ? initialsOf(profile.full_name) : userInitials);

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    try { await getSupabase().auth.signOut(); } catch { /* ignore */ }
    router.replace("/login");
  }

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 right-3 z-40 w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] grid place-items-center"
        aria-label="القائمة"
      >
        ☰
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 h-screen w-72 bg-[var(--bg-elev)] border-l border-[var(--border)] flex flex-col transition-transform",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
        dir="rtl"
      >
        {/* Tenant header */}
        <div className="p-4 border-b border-[var(--border)]">
          <Link href={baseHref} className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-lg bg-[var(--brand)] text-black grid place-items-center font-display font-black text-lg">
              {effTenantName.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm truncate">{effTenantName}</div>
              <div className="text-[10px] text-[var(--text-faint)] font-mono" dir="ltr">
                {effTenantSlug}.qaf.sa
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {nav.map((sec, sIdx) => (
            <div key={sIdx} className="mb-4">
              {sec.title_ar && (
                <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)] px-3 mb-1.5">
                  {sec.title_ar}
                </div>
              )}
              <div className="space-y-0.5">
                {sec.items.map((it) => {
                  const href = baseHref + it.href;
                  const isActive =
                    pathname === href ||
                    (it.href === "" && pathname === baseHref);
                  return (
                    <Link
                      key={it.key}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-[var(--brand)]/10 text-[var(--brand)] font-semibold"
                          : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]",
                      )}
                    >
                      <span className="text-base shrink-0">{it.icon}</span>
                      <span className="flex-1 truncate">{it.label_ar}</span>
                      {it.badge ? (
                        <span className="text-[10px] bg-[var(--accent)] text-white px-1.5 rounded-full">
                          {it.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Operator-only shortcut — never rendered for normal users/visitors */}
        {isOperator && (
          <Link
            href="/admin"
            className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 transition-colors"
          >
            🛠 لوحة المشغّل
            <span className="ms-auto text-[9px] font-mono opacity-70">OPERATOR</span>
          </Link>
        )}

        {/* User footer */}
        <div className="p-3 border-t border-[var(--border)] flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-[var(--brand-deep)] text-black grid place-items-center font-bold text-sm shrink-0">
            {effUserInitials}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{effUserName}</div>
            <div className="text-[10px] text-[var(--text-faint)] truncate">
              {effUserRole}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="تسجيل الخروج"
            className="w-9 h-9 rounded-lg grid place-items-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--danger)] transition-colors"
          >
            ⏻
          </button>
        </div>
      </aside>
    </>
  );
}
