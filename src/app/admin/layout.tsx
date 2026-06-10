import Link from "next/link";
import { QafWordmark } from "@/components/landing/QafLogo";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { AdminGate } from "@/components/admin/AdminGate";

const ADMIN_NAV = [
  { href: "/admin", label: "نظرة عامة", icon: "📊" },
  { href: "/admin/tenants", label: "المكاتب", icon: "🏢" },
  { href: "/admin/users", label: "المستخدمون", icon: "👥" },
  { href: "/admin/grants", label: "المنح والعروض", icon: "🎁" },
  { href: "/admin/revenue", label: "الإيرادات", icon: "💰" },
  { href: "/admin/addons", label: "إدارة الإضافات", icon: "🧩" },
  { href: "/admin/support", label: "تذاكر الدعم", icon: "🎫" },
  { href: "/admin/logs", label: "سجل النشاط", icon: "📜" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
    <ToastProvider>
    <AdminGate>
    <div className="grid lg:grid-cols-[240px_1fr] min-h-screen bg-[var(--bg)] text-[var(--text)]" dir="rtl">
      <aside className="lg:sticky top-0 lg:h-screen bg-[var(--bg-elev)] border-l border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <Link href="/admin" className="flex items-center gap-2">
            <QafWordmark />
            <span className="ms-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--accent)] text-white">
              ADMIN
            </span>
          </Link>
          <div className="text-[10px] text-[var(--text-faint)] mt-2 font-mono" dir="ltr">
            admin.qaf.sa
          </div>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-0.5">
            {ADMIN_NAV.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)] transition-colors"
              >
                <span>{it.icon}</span>
                {it.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-[var(--border)] text-[10px] text-[var(--text-faint)] font-mono">
          // مستوى الوصول: Platform Admin
        </div>
      </aside>

      <div className="min-w-0 flex flex-col">{children}</div>
    </div>
    </AdminGate>
    </ToastProvider>
    </ThemeProvider>
  );
}
