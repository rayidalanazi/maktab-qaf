"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "time" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  dir?: "rtl" | "ltr";
  /** render on half the row (two fields per line on sm+) */
  half?: boolean;
  default?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  fields: FormField[];
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

/**
 * Reusable "create / edit record" form in a modal. Each page passes a field
 * schema + an onSubmit (which usually calls a create* mutation then reloads).
 */
export function RecordFormModal({
  open, onClose, title, sub, fields, submitLabel = "حفظ", onSubmit,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed defaults whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    const seed: Record<string, string> = {};
    for (const f of fields) if (f.default) seed[f.name] = f.default;
    setValues(seed);
    setError(null);
    setPending(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set(name: string, v: string) {
    setValues((p) => ({ ...p, [name]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !(values[f.name] || "").trim()) {
        setError(`${f.label} مطلوب`);
        return;
      }
    }
    setPending(true);
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)] text-sm";

  return (
    <Modal open={open} onClose={onClose} title={title} sub={sub}>
      <form onSubmit={submit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {fields.map((f) => (
            <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
              <label className="block text-xs font-semibold mb-1.5 text-[var(--text)]">
                {f.label}
                {f.required && <span className="text-[var(--accent)]"> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  className={inputCls + " min-h-[80px] resize-y"}
                  dir={f.dir}
                  placeholder={f.placeholder}
                  value={values[f.name] || ""}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              ) : f.type === "select" ? (
                <select
                  className={inputCls}
                  value={values[f.name] || ""}
                  onChange={(e) => set(f.name, e.target.value)}
                >
                  <option value="">— اختر —</option>
                  {(f.options || []).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "time" ? "time" : "text"}
                  className={inputCls}
                  dir={f.dir || (f.type === "number" || f.type === "date" || f.type === "time" ? "ltr" : undefined)}
                  placeholder={f.placeholder}
                  value={values[f.name] || ""}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="text-[12px] text-[var(--danger)] bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg p-2.5 leading-relaxed">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="btn btn-ghost text-sm py-2.5 px-4 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={pending}
            className="btn btn-brand text-sm py-2.5 px-5 disabled:opacity-50"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                جاري الحفظ...
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
