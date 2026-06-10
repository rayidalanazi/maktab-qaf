"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  help?: string;
  error?: string;
  rightAddon?: React.ReactNode;
  leftAddon?: React.ReactNode;
}

/**
 * Branded text input. Pairs label + input + help/error in a single block.
 * Used in login, signup, settings, anywhere we collect text.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, help, error, rightAddon, leftAddon, className, ...rest },
  ref,
) {
  const hasError = !!error;
  return (
    <label className="block">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-[var(--text)]">{label}</span>
          {help && !error && (
            <span className="text-[10px] text-[var(--text-faint)]">{help}</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "relative flex items-stretch rounded-lg border transition-colors",
          "bg-[var(--bg-card)]",
          hasError
            ? "border-[var(--danger)] focus-within:border-[var(--danger)]"
            : "border-[var(--border)] focus-within:border-[var(--brand)]",
        )}
      >
        {leftAddon && (
          <span className="grid place-items-center px-3 text-sm text-[var(--text-faint)] border-l border-[var(--border)] bg-[var(--bg)]/40">
            {leftAddon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "flex-1 min-w-0 bg-transparent px-3.5 py-3 text-sm placeholder:text-[var(--text-faint)] outline-none",
            className,
          )}
          aria-invalid={hasError || undefined}
          {...rest}
        />
        {rightAddon && (
          <span className="grid place-items-center px-3 text-sm text-[var(--text-faint)] border-r border-[var(--border)] bg-[var(--bg)]/40">
            {rightAddon}
          </span>
        )}
      </div>
      {error && (
        <div className="mt-1.5 text-[11px] text-[var(--danger)] flex items-center gap-1.5">
          <span>⚠</span>
          {error}
        </div>
      )}
    </label>
  );
});
