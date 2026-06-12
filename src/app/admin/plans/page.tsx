"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { useAdminData } from "@/hooks/useAdminData";
import {
  fetchBundles, updateBundleAddons, applyTierAddonsToFirms,
} from "@/lib/data/queries";
import type { AdminBundleRow } from "@/lib/data/types";
import { ADDONS, CATEGORIES, BUNDLES } from "@/data/pricing";

const FALLBACK_BUNDLES: AdminBundleRow[] = BUNDLES.map((b, i) => ({
  bundleKey: b.key,
  nameAr: b.name_ar,
  priceSar: b.price_monthly_sar,
  addonKeys: b.included_addon_keys,
  sort: i + 1,
}));

export default function AdminPlansPage() {
  const { data: bundles, isLive, reload } = useAdminData(fetchBundles, FALLBACK_BUNDLES);
  const addonMap = useMemo(() => new Map(ADDONS.map((a) => [a.key, a])), []);
  const catSorted = useMemo(() => [...CATEGORIES].sort((a, b) => a.order - b.order), []);

  const [editKey, setEditKey] = useState<string | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ key: string; text: string; ok: boolean } | null>(null);

  function startEdit(b: AdminBundleRow) {
    setEditKey(b.bundleKey);
    setSel(new Set(b.addonKeys));
    setMsg(null);
  }
  function toggle(k: string) {
    setSel((p) => {
      const n = new Set(p);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  }

  async function save(b: AdminBundleRow, applyExisting: boolean) {
    setBusy(true);
    setMsg(null);
    try {
      const keys = [...sel];
      await updateBundleAddons(b.bundleKey, keys);
      let applied = 0;
      if (applyExisting) applied = await applyTierAddonsToFirms(b.bundleKey, keys);
      setMsg({
        key: b.bundleKey, ok: true,
        text: applyExisting
          ? `حُفظ + طُبّق على ${applied} مكتب من هذه الفئة`
          : "حُفظ — يسري على المكاتب الجديدة لهذه الفئة",
      });
      reload();
      setEditKey(null);
    } catch (e) {
      setMsg({ key: b.bundleKey, ok: false, text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Topbar title="الباقات والفئات" breadcrumb={["Admin", "الباقات"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="📦 الباقات والفئات"
          sub="خصّص إضافات كل فئة (محامي / صغير / متوسط / Enterprise) — وتنعكس على المستخدمين حسب تصنيفهم"
        />

        {!isLive && (
          <div className="mb-5 rounded-xl border border-[var(--warn)]/30 bg-[var(--warn)]/10 text-[var(--warn)] text-xs px-4 py-2.5">
            وضع عرض — ادخل كمشغّل لحفظ التعديلات على القاعدة.
          </div>
        )}

        <div className="space-y-4">
          {bundles.map((b) => {
            const editing = editKey === b.bundleKey;
            return (
              <div key={b.bundleKey} className="card">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-lg">{b.nameAr}</h3>
                      <span className="font-mono text-[var(--brand)] text-sm num" dir="ltr">{b.priceSar} ر.س/شهر</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-faint)]">
                      {(editing ? sel.size : b.addonKeys.length)} ميزة مفعّلة لهذه الفئة
                    </div>
                  </div>
                  <button
                    onClick={() => (editing ? setEditKey(null) : startEdit(b))}
                    className={`btn text-sm py-2 px-4 ${editing ? "btn-ghost" : "btn-brand"}`}
                  >
                    {editing ? "إلغاء" : "✎ تعديل الإضافات"}
                  </button>
                </div>

                {msg && msg.key === b.bundleKey && (
                  <div className={`mt-3 text-[12px] rounded-lg px-3 py-2 ${msg.ok ? "text-[var(--success)] bg-[var(--success)]/10" : "text-[var(--danger)] bg-[var(--danger)]/10"}`}>
                    {msg.text}
                  </div>
                )}

                {!editing ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {b.addonKeys.map((k) => (
                      <span key={k} className="text-[10px] px-2 py-1 rounded-full bg-[var(--bg-hover)] text-[var(--text-muted)]">
                        {addonMap.get(k)?.name_ar ?? k}
                      </span>
                    ))}
                    {b.addonKeys.length === 0 && (
                      <span className="text-xs text-[var(--text-faint)]">لا إضافات بعد.</span>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 border-t border-[var(--border)] pt-4">
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pe-1">
                      {catSorted.map((cat) => {
                        const items = ADDONS.filter((a) => a.category === cat.key);
                        if (!items.length) return null;
                        return (
                          <div key={cat.key}>
                            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[var(--text-muted)]">
                              <span>{cat.icon}</span>{cat.label_ar}
                            </div>
                            <div className="grid sm:grid-cols-2 gap-1.5">
                              {items.map((a) => {
                                const on = sel.has(a.key);
                                return (
                                  <label
                                    key={a.key}
                                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                      on ? "border-[var(--brand)] bg-[var(--brand)]/8" : "border-[var(--border)] hover:border-[var(--border-strong)]"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={on}
                                      onChange={() => toggle(a.key)}
                                      className="accent-[var(--brand)] mt-0.5 shrink-0"
                                    />
                                    <span className="min-w-0">
                                      <span className="block text-xs font-semibold truncate">{a.name_ar}</span>
                                      <span className="block text-[10px] text-[var(--text-faint)] num" dir="ltr">
                                        {a.price_monthly_sar > 0 ? `${a.price_monthly_sar} ر.س` : "مجانية"}
                                      </span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                      <span className="text-[11px] text-[var(--text-faint)] me-auto">
                        {sel.size} ميزة مختارة
                      </span>
                      <button
                        onClick={() => save(b, false)}
                        disabled={busy}
                        className="btn btn-ghost text-sm py-2 px-4 disabled:opacity-50"
                      >
                        حفظ (الجدد فقط)
                      </button>
                      <button
                        onClick={() => save(b, true)}
                        disabled={busy}
                        className="btn btn-brand text-sm py-2 px-4 disabled:opacity-50"
                      >
                        {busy ? "جاري..." : "حفظ + تطبيق على المكاتب الحالية"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-[var(--text-faint)] mt-6 font-mono">
          // «حفظ» يسري على المكاتب الجديدة فقط · «تطبيق على الحالية» يضيف الإضافات للمكاتب القائمة من نفس الفئة (لا يحذف مشترياتهم)
        </p>
      </main>
    </>
  );
}
