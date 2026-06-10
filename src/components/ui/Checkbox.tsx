"use client";

import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  size?: "sm" | "md";
}

/**
 * Branded checkbox/card combo. Used in the addon picker.
 */
export function Checkbox({
  checked,
  onChange,
  disabled,
  label,
  description,
  rightAccessory,
  size = "md",
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full text-right rounded-xl border p-4 transition-all flex items-start gap-3",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        checked
          ? "border-[var(--brand)] bg-[var(--brand)]/8"
          : "border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--bg-card)]",
        size === "sm" ? "p-3" : "p-4",
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded grid place-items-center transition-all",
          checked ? "bg-[var(--brand)] text-black" : "border border-[var(--border-strong)]",
          size === "sm" ? "w-5 h-5 mt-0.5 text-xs" : "w-5 h-5 mt-0.5 text-xs",
        )}
      >
        {checked && "✓"}
      </span>
      <span className="flex-1 min-w-0">
        {label && <div className="font-semibold text-sm leading-tight">{label}</div>}
        {description && (
          <div className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
            {description}
          </div>
        )}
      </span>
      {rightAccessory && <span className="shrink-0">{rightAccessory}</span>}
    </button>
  );
}
