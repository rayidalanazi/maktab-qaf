"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { SubdomainInput } from "./SubdomainInput";
import {
  validateFirmNameAr,
  suggestSubdomainFromFirmName,
  type SubdomainStatus,
} from "@/lib/signup-validation";
import { BUNDLES } from "@/data/pricing";

export type PlanKey =
  | "bundle_base" | "bundle_small" | "bundle_medium" | "bundle_enterprise" | "";

export interface WorkspaceValues {
  firmNameAr: string;
  subdomain: string;
  /** the chosen bundle key — decides which features the office sees */
  firmSize: PlanKey;
  tosAccept: boolean;
}

interface Props {
  values: WorkspaceValues;
  setValues: (v: WorkspaceValues) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

const PLAN_OPTIONS = BUNDLES.map((b) => ({
  v: b.key as PlanKey,
  label: b.name_ar,
  price: b.price_monthly_sar,
  seats: b.user_seats,
  count: b.included_addon_keys.length,
  recommended: b.is_recommended,
}));

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
    if (!values.firmSize) next.firmSize = "اختر باقتك.";
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
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">اختر باقتك</div>
          <span className="text-[10px] text-[var(--text-faint)] font-mono">
            // تشوف مميزات باقتك فقط — وترقّي وقت ما تبي
          </span>
        </div>
        <div className="space-y-2">
          {PLAN_OPTIONS.map((p) => {
            const active = values.firmSize === p.v;
            return (
              <button
                key={p.v}
                type="button"
                onClick={() => update("firmSize", p.v)}
                className={`w-full text-right p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                  active
                    ? "border-[var(--brand)] bg-[var(--brand)]/10"
                    : "border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--bg-card)]"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{p.label}</span>
                    {p.recommended && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--brand)] text-black">
                        الأكثر طلباً
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--text-faint)] truncate">
                    {p.seats} · {p.count} ميزة
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <span className="font-display font-black num" dir="ltr">{p.price}</span>
                  <span className="text-[10px] text-[var(--text-faint)]"> ر.س/شهر</span>
                </div>
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
