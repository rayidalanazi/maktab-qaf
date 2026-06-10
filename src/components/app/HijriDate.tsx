"use client";

import { useEffect, useState } from "react";
import { todayDual, dualDate, formatHijri } from "@/lib/hijri";

/**
 * Today's date in both calendars — shown in the app topbar.
 * Client component so it reflects the USER's real "today" (not build time).
 */
export function HijriToday() {
  const [d, setD] = useState<{ hijri: string; hijriWeekday: string; gregorian: string } | null>(null);

  useEffect(() => {
    setD(todayDual());
  }, []);

  if (!d) return null;

  return (
    <div className="hidden sm:flex flex-col items-end leading-tight ps-3 me-1 border-s border-[var(--border)]">
      <span className="text-[11px] font-semibold text-[var(--text)]">
        {d.hijriWeekday} · {d.hijri}
      </span>
      <span className="text-[10px] text-[var(--text-faint)] num" dir="ltr">
        {d.gregorian}
      </span>
    </div>
  );
}

/**
 * Inline dual date: Hijri (primary) with Gregorian beneath.
 * Plain component (Intl works server-side) — safe in server components.
 */
export function DualDate({
  date,
  className = "",
  size = "sm",
}: {
  date: string | Date;
  className?: string;
  size?: "xs" | "sm";
}) {
  const { hijri, gregorian } = dualDate(date);
  return (
    <span className={`inline-flex flex-col leading-tight ${className}`}>
      <span className={size === "xs" ? "text-[11px]" : "text-xs"}>{hijri}</span>
      <span className="text-[10px] text-[var(--text-faint)] num" dir="ltr">
        {gregorian}
      </span>
    </span>
  );
}

/** Just the Hijri string inline (for tight spaces). */
export function HijriInline({ date }: { date: string | Date }) {
  return <span>{formatHijri(date, { withEra: true })}</span>;
}
