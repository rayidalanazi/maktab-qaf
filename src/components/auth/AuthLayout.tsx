import Link from "next/link";
import { QafWordmark } from "@/components/landing/QafLogo";

interface AuthLayoutProps {
  side: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Two-column auth layout. Form on one side (right in RTL), brand on the other.
 * On mobile it collapses to a single column with the brand on top.
 */
export function AuthLayout({ side, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_minmax(380px,500px)] bg-[var(--bg)]">
      {/* Brand side */}
      <aside className="relative overflow-hidden bg-noise hidden lg:flex flex-col justify-between p-10 border-l border-[var(--border)]">
        <div
          className="blob"
          style={{
            background: "var(--brand)",
            width: 600,
            height: 600,
            top: -200,
            right: -200,
            opacity: 0.18,
          }}
        />
        <div
          className="blob"
          style={{
            background: "var(--accent)",
            width: 400,
            height: 400,
            bottom: -150,
            left: -150,
            opacity: 0.10,
          }}
        />
        <div className="absolute inset-0 bg-grid opacity-40" />

        <Link href="/" className="relative">
          <QafWordmark />
        </Link>

        <div className="relative">{side}</div>

        <div className="relative text-xs text-[var(--text-faint)] flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          كل الأنظمة تعمل بشكل طبيعي
        </div>
      </aside>

      {/* Form side */}
      <main className="flex flex-col">
        {/* Mobile header (logo) */}
        <header className="lg:hidden p-6 border-b border-[var(--border)] flex items-center justify-between">
          <Link href="/">
            <QafWordmark />
          </Link>
          <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
            ← الرئيسية
          </Link>
        </header>

        <div className="flex-1 grid place-items-center px-6 py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
