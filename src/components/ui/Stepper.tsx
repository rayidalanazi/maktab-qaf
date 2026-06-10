"use client";

import { cn } from "@/lib/utils";

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  size?: "sm" | "md";
}

/**
 * Numeric stepper with +/- buttons. Used for seat count, storage GB.
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
  size = "md",
}: StepperProps) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  const btnCls =
    size === "sm" ? "w-7 h-7 text-base" : "w-9 h-9 text-lg";

  return (
    <div className="inline-flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-full p-1">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className={cn(
          "grid place-items-center rounded-full font-bold transition-all",
          "hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed",
          btnCls,
        )}
        aria-label="نقص"
      >
        −
      </button>
      <span className="min-w-[3rem] text-center font-bold num text-sm">
        {value}
        {suffix && <span className="text-[var(--text-faint)] text-xs ms-1">{suffix}</span>}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className={cn(
          "grid place-items-center rounded-full font-bold transition-all",
          "hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed",
          btnCls,
        )}
        aria-label="زيادة"
      >
        +
      </button>
    </div>
  );
}
