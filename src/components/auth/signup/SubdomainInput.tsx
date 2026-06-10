"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  checkSubdomainAvailability,
  validateSubdomain,
  type SubdomainStatus,
} from "@/lib/signup-validation";

interface SubdomainInputProps {
  value: string;
  onChange: (v: string) => void;
  onStatusChange?: (status: SubdomainStatus) => void;
  baseDomain?: string;
}

const DEBOUNCE_MS = 400;

export function SubdomainInput({
  value,
  onChange,
  onStatusChange,
  baseDomain = "qaf.sa",
}: SubdomainInputProps) {
  const [status, setStatus] = useState<SubdomainStatus>("idle");
  const [reason, setReason] = useState<string | undefined>();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    setSuggestions([]);
    setReason(undefined);

    if (!value) {
      setStatus("idle");
      return;
    }

    // Local validation first
    const local = validateSubdomain(value);
    if (local.status !== "idle") {
      setStatus(local.status);
      setReason(local.reason);
      return;
    }

    // Debounce + network
    setStatus("checking");
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      try {
        const r = await checkSubdomainAvailability(value, controller.signal);
        setStatus(r.status);
        if (r.suggestions) setSuggestions(r.suggestions);
      } catch {
        // aborted — ignore
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [value]);

  const statusInfo = {
    idle: { icon: "", color: "var(--text-faint)", label: "" },
    checking: { icon: "…", color: "var(--text-muted)", label: "نتحقّق..." },
    available: { icon: "✓", color: "var(--brand)", label: "متاح" },
    invalid: { icon: "⚠", color: "var(--warn)", label: "غير صالح" },
    reserved: { icon: "🔒", color: "var(--accent)", label: "محجوز" },
    taken: { icon: "✕", color: "var(--accent)", label: "مأخوذ" },
    error: { icon: "?", color: "var(--warn)", label: "تعذر التحقق" },
  }[status];

  return (
    <div>
      <label className="block">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-[var(--text)]">
            اسم نطاقك على قاف
          </span>
          {status !== "idle" && (
            <span
              className="text-[11px] font-mono flex items-center gap-1"
              style={{ color: statusInfo.color }}
            >
              {statusInfo.icon} {statusInfo.label}
            </span>
          )}
        </div>

        <div
          className={cn(
            "flex items-stretch rounded-lg border transition-colors bg-[var(--bg-card)]",
            status === "available" && "border-[var(--brand)]",
            (status === "taken" || status === "reserved") && "border-[var(--accent)]",
            status === "invalid" && "border-[var(--warn)]",
            status === "idle" && "border-[var(--border)] focus-within:border-[var(--brand)]",
            status === "checking" && "border-[var(--border)]",
          )}
        >
          <input
            type="text"
            inputMode="text"
            dir="ltr"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="rashed"
            value={value}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
            className="flex-1 min-w-0 bg-transparent px-3.5 py-3 text-sm placeholder:text-[var(--text-faint)] outline-none font-mono text-end"
          />
          <span
            className="grid place-items-center px-3.5 text-sm text-[var(--text-muted)] border-r border-[var(--border)] bg-[var(--bg)]/40 font-mono"
            dir="ltr"
          >
            .{baseDomain}
          </span>
        </div>

        {reason && (
          <div className="mt-1.5 text-[11px] text-[var(--warn)] leading-relaxed">
            {reason}
          </div>
        )}

        {!reason && status === "available" && (
          <div className="mt-1.5 text-[11px] text-[var(--brand)] font-mono">
            // متاح — يصير {value}.{baseDomain}
          </div>
        )}

        {!reason && status === "taken" && (
          <div className="mt-2 text-[11px]">
            <div className="text-[var(--accent)] mb-1.5">
              هذا الاسم محجوز. // اختر غيره — في أسماء أحلى
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange(s)}
                    className="px-2.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--brand)] font-mono text-[10px]"
                    dir="ltr"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!reason && status === "idle" && value.length === 0 && (
          <div className="mt-1.5 text-[10px] text-[var(--text-faint)] font-mono">
            // حروف صغيرة وأرقام فقط. النطاق الخاص (yourfirm.sa) إضافة لاحقة بـ 79 ر.س
          </div>
        )}
      </label>
    </div>
  );
}
