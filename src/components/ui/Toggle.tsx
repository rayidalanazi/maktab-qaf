"use client";

import { cn } from "@/lib/utils";

interface ToggleOption<T extends string> {
  value: T;
  label: string;
  badge?: string;
}

interface ToggleProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: ToggleOption<T>[];
  size?: "sm" | "md" | "lg";
}

/**
 * Segmented toggle — used for billing-cycle (monthly/annual), etc.
 */
export function Toggle<T extends string>({
  value,
  onChange,
  options,
  size = "md",
}: ToggleProps<T>) {
  const sizeCls =
    size === "sm" ? "h-9 text-sm p-1" : size === "lg" ? "h-12 text-base p-1.5" : "h-11 text-sm p-1";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-[var(--bg-card)] border border-[var(--border)]",
        sizeCls,
      )}
      role="tablist"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "px-4 h-full rounded-full transition-all font-semibold flex items-center gap-2",
              active
                ? "bg-[var(--brand)] text-black shadow"
                : "text-[var(--text-muted)] hover:text-[var(--text)]",
            )}
          >
            {o.label}
            {o.badge && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  active ? "bg-black/15 text-black" : "bg-[var(--accent)]/15 text-[var(--accent)]",
                )}
              >
                {o.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
