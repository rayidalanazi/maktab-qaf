import Link from "next/link";
import { QafWordmark } from "./QafLogo";

const NAV = [
  { label: "المنتج", href: "#features" },
  { label: "الأسعار", href: "#pricing" },
  { label: "الأسئلة", href: "#faq" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg)]/70 border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <QafWordmark />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors px-3 py-2"
          >
            دخول
          </Link>
          <Link href="/signup" className="btn btn-brand text-sm">
            ابدأ مجاناً
            <span className="arrow-flip">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
