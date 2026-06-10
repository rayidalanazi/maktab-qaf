"use client";

import { useState } from "react";

interface TopbarProps {
  title: string;
  sub?: string;
  breadcrumb?: string[];
}

export function Topbar({ title, sub, breadcrumb }: TopbarProps) {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg)]/85 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="px-4 sm:px-6 h-14 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="text-[10px] font-mono text-[var(--text-faint)] flex items-center gap-1 mb-0.5">
              {breadcrumb.map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span>›</span>}
                  <span>{b}</span>
                </span>
              ))}
            </div>
          )}
          <h1 className="font-bold text-base sm:text-lg truncate">{title}</h1>
          {sub && <div className="text-xs text-[var(--text-faint)] truncate">{sub}</div>}
        </div>

        <div className="hidden md:flex relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في النظام... (Ctrl+K)"
            className="w-72 ps-9 pe-3 py-2 text-sm rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)] transition-colors"
          />
        </div>

        <button
          type="button"
          aria-label="الإشعارات"
          className="w-10 h-10 rounded-lg grid place-items-center text-lg hover:bg-[var(--bg-hover)] relative"
        >
          🔔
          <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[var(--accent)]" />
        </button>
      </div>
    </header>
  );
}
