"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { SubdomainInput } from "./SubdomainInput";
import {
  validateFirmNameAr,
  suggestSubdomainFromFirmName,
  type SubdomainStatus,
} from "@/lib/signup-validation";

export interface WorkspaceValues {
  firmNameAr: string;
  subdomain: string;
  firmSize: "solo" | "small" | "medium" | "large" | "";
  tosAccept: boolean;
}

interface Props {
  values: WorkspaceValues;
  setValues: (v: WorkspaceValues) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

const FIRM_SIZES = [
  { v: "solo" as const, label: "محامي مستقل", sub: "1 مستخدم" },
  { v: "small" as const, label: "صغير", sub: "2–5 مستخدمين" },
  { v: "medium" as const, label: "متوسط", sub: "6–20 مستخدم" },
  { v: "large" as const, label: "كبير", sub: "+20 مستخدم" },
];

export function WorkspaceStep({ values, setValues, onBack, onSubmit, submitting }: Props) {
  const [subdomainStatus, setSubdomainStatus] = useState<SubdomainStatus>("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof WorkspaceValues, string>>>({});
  const [autoSuggested, setAutoSuggested] = useState(false);

  // Auto-suggest subdomain from firm name (once, until user types it)
  useEffect(() => {
    if (!values.subdomain && values.firmNameAr && !autoSuggested) {
      const suggestion = suggestSubdomainFromFirmName(values.firmNameAr);
      if (suggestion.length >= 3) {
        setValues({ ...values, subdomain: suggestion });
        setAutoSuggested(true);
      }
    }
  }, [values.firmNameAr]);  // eslint-disable-line react-hooks/exhaustive-deps

  function update<K extends keyof WorkspaceValues>(key: K, v: WorkspaceValues[K]) {
    setValues({ ...values, [key]: v });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    const firmR = validateFirmNameAr(values.firmNameAr);
    if (!firmR.ok) next.firmNameAr = firmR.reason;
    if (subdomainStatus !== "available") {
      next.subdomain = "النطاق لازم يكون متاح قبل الإنشاء.";
    }
    if (!values.firmSize) next.firmSize = "اختر حجم مكتبك.";
    if (!values.tosAccept) next.tosAccept = "لازم توافق على الشروط عشان نكمل.";
    setErrors(next);

    if (Object.keys(next).length === 0) {
      onSubmit();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="اسم المكتب"
        type="text"
        autoComplete="organization"
        required
        placeholder="مكتب الراشد للمحاماة"
        value={values.firmNameAr}
        onChange={(e) => update("firmNameAr", e.target.value)}
        error={errors.firmNameAr}
        help="يظهر في الفواتير والمراسلات — يقدر يتغيّر لاحقاً"
      />

      <SubdomainInput
        value={values.subdomain}
        onChange={(v) => update("subdomain", v)}
        onStatusChange={setSubdomainStatus}
      />
      {errors.subdomain && (
        <div className="text-[11px] text-[var(--warn)] -mt-2">{errors.subdomain}</div>
      )}

      <div>
        <div className="text-sm font-semibold mb-2">حجم مكتبك</div>
        <div className="grid grid-cols-2 gap-2">
          {FIRM_SIZES.map((s) => {
            const active = values.firmSize === s.v;
            return (
              <button
                key={s.v}
                type="button"
                onClick={() => update("firmSize", s.v)}
                className={`text-right p-3 rounded-lg border transition-all ${
                  active
                    ? "border-[var(--brand)] bg-[var(--brand)]/10"
                    : "border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--bg-card)]"
                }`}
              >
                <div className="font-bold text-sm">{s.label}</div>
                <div className="text-[10px] text-[var(--text-faint)]">{s.sub}</div>
              </button>
            );
          })}
        </div>
        {errors.firmSize && (
          <div className="text-[11px] text-[var(--warn)] mt-1.5">{errors.firmSize}</div>
        )}
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer text-sm">
        <input
          type="checkbox"
          checked={values.tosAccept}
          onChange={(e) => update("tosAccept", e.target.checked)}
          className="accent-[var(--brand)] mt-0.5"
        />
        <span className="text-[var(--text-muted)] leading-relaxed">
          أوافق على{" "}
          <a href="/terms" className="text-[var(--brand)] hover:underline">
            الشروط
          </a>
          {" و "}
          <a href="/privacy" className="text-[var(--brand)] hover:underline">
            سياسة الخصوصية
          </a>
          {" "}
          <span className="text-[10px] text-[var(--text-faint)] font-mono">
            // متوافقة مع PDPL
          </span>
        </span>
      </label>
      {errors.tosAccept && (
        <div className="text-[11px] text-[var(--warn)] -mt-2">{errors.tosAccept}</div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="btn btn-ghost px-5 py-3.5 disabled:opacity-50"
        >
          <span className="arrow-flip">←</span> رجوع
        </button>
        <button
          type="submit"
          disabled={submitting || subdomainStatus !== "available"}
          className="btn btn-brand flex-1 py-3.5 disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              جاري إنشاء مكتبك...
            </span>
          ) : (
            <>
              ادخل لوحة التحكم
              <span className="arrow-flip">→</span>
            </>
          )}
        </button>
      </div>

      <p className="text-[10px] text-center text-[var(--text-faint)] font-mono">
        // بدأت بالأساس 49 ر.س — تقدر ترقي أو تضيف إضافات من اللوحة
      </p>
    </form>
  );
}
