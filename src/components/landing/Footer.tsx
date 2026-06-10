import Link from "next/link";
import { QafWordmark } from "./QafLogo";

const LINKS = {
  المنتج: [
    { l: "المميزات", h: "#features" },
    { l: "الأسعار", h: "#pricing" },
    { l: "تحديثات", h: "/changelog" },
    { l: "خارطة الطريق", h: "/roadmap" },
  ],
  الشركة: [
    { l: "من نحن", h: "/about" },
    { l: "المدوّنة", h: "/blog" },
    { l: "اتصل بنا", h: "/contact" },
    { l: "وظائف", h: "/careers" },
  ],
  قانوني: [
    { l: "سياسة الخصوصية", h: "/privacy" },
    { l: "شروط الاستخدام", h: "/terms" },
    { l: "اتفاقية معالجة البيانات", h: "/dpa" },
    { l: "الأمن", h: "/security" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 mb-12">
          <div>
            <QafWordmark className="mb-4" />
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
              منصّة سعودية لإدارة مكاتب المحاماة. صُنعت في الرياض، لأهل الرياض،
              وكل المملكة.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a className="w-9 h-9 rounded-lg border border-[var(--border)] grid place-items-center hover:border-[var(--brand)] transition-colors">
                𝕏
              </a>
              <a className="w-9 h-9 rounded-lg border border-[var(--border)] grid place-items-center hover:border-[var(--brand)] transition-colors">
                in
              </a>
              <a className="w-9 h-9 rounded-lg border border-[var(--border)] grid place-items-center hover:border-[var(--brand)] transition-colors">
                ✉
              </a>
            </div>
          </div>

          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--text-faint)] mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((it) => (
                  <li key={it.l}>
                    <Link
                      href={it.h}
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    >
                      {it.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[var(--text-faint)] font-mono">
            © 2026 قاف. كل الحقوق محفوظة.
          </div>
          <div className="text-xs text-[var(--text-faint)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            كل الأنظمة تعمل
          </div>
        </div>
      </div>
    </footer>
  );
}
