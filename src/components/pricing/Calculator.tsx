"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ADDONS,
  CATEGORIES,
  BUNDLES,
  FEATURED_ADDON_KEYS,
  getAddon,
  getCategory,
} from "@/data/pricing";
import {
  compute,
  toggleAddon,
  type CalculatorInput,
} from "@/lib/pricing-calc";
import type { BillingCycle } from "@/types/pricing";
import { Toggle } from "@/components/ui/Toggle";
import { Stepper } from "@/components/ui/Stepper";
import { Checkbox } from "@/components/ui/Checkbox";

const CATEGORY_ORDER = CATEGORIES.slice().sort((a, b) => a.order - b.order);

export function Calculator() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [seats, setSeats] = useState(1);
  const [storage, setStorage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [autoNote, setAutoNote] = useState<string[]>([]);

  const input: CalculatorInput = useMemo(
    () => ({
      cycle,
      mode: "custom",
      bundleKey: null,
      customAddonKeys: selected,
      seats,
      extraStorageBundles: storage,
    }),
    [cycle, seats, storage, selected],
  );

  const result = useMemo(() => compute(input), [input]);

  const handleToggle = useCallback(
    (key: string, on: boolean) => {
      const { next, autoChanges } = toggleAddon(selected, key, on);
      setSelected(next);
      setAutoNote(autoChanges);
      if (autoChanges.length) setTimeout(() => setAutoNote([]), 4200);
    },
    [selected],
  );

  const switchToBundle = useCallback((bundleKey: string) => {
    const b = BUNDLES.find((x) => x.key === bundleKey);
    if (!b) return;
    // Preload bundle addons as selected so user can keep tweaking
    setSelected(new Set(b.included_addon_keys));
    const seatMatch = b.user_seats.match(/(\d+)/);
    setSeats(seatMatch ? parseInt(seatMatch[1], 10) : 1);
  }, []);

  const featured = FEATURED_ADDON_KEYS.map((k) => getAddon(k)).filter(Boolean);

  return (
    <section id="calculator" className="py-20 border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="pill mb-4">// احسبها بنفسك</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4 leading-tight">
            كم بتدفع
            <br />
            <span className="text-gradient-brand">فعلاً؟</span>
          </h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            حدّد عدد المستخدمين، والميزات اللي تبيها، ونعطيك الرقم النهائي. الرقم اللي تشوفه = اللي تدفعه.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* ─── Left: inputs ─── */}
          <div className="space-y-6">
            {/* Cycle + seats card */}
            <div className="card">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs font-mono text-[var(--text-faint)] mb-1.5 uppercase tracking-widest">
                    // دورة الفوترة
                  </div>
                  <Toggle
                    value={cycle}
                    onChange={setCycle}
                    options={[
                      { value: "monthly", label: "شهري" },
                      { value: "annual", label: "سنوي", badge: "وفّر 17%" },
                    ]}
                  />
                </div>
                <div>
                  <div className="text-xs font-mono text-[var(--text-faint)] mb-1.5 uppercase tracking-widest">
                    // عدد المستخدمين
                  </div>
                  <div className="flex items-center gap-3">
                    <Stepper value={seats} onChange={setSeats} min={1} max={50} />
                    <span className="text-xs text-[var(--text-faint)] hidden sm:inline">
                      السكرتارية مجانية
                    </span>
                  </div>
                </div>
              </div>

              {seats > 1 && (
                <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] rounded-lg px-3 py-2 border border-[var(--border)]">
                  💡 {seats - 1} مستخدم إضافي × 39 ر.س ={" "}
                  <span className="font-bold text-[var(--text)]">
                    {(seats - 1) * 39} ر.س/شهر
                  </span>
                </div>
              )}
            </div>

            {/* Featured addons */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-mono text-[var(--text-faint)] uppercase tracking-widest">
                  // الإضافات الشائعة
                </div>
                <span className="text-[10px] text-[var(--text-faint)]">
                  اختر اللي تحتاجه
                </span>
              </div>

              <div className="space-y-2.5">
                {featured.map(
                  (a) =>
                    a && (
                      <Checkbox
                        key={a.key}
                        checked={selected.has(a.key)}
                        onChange={(v) => handleToggle(a.key, v)}
                        label={
                          <div className="flex items-center justify-between gap-3">
                            <span>{a.name_ar}</span>
                            <span className="text-[var(--brand)] font-mono text-xs num">
                              +{a.price_monthly_sar} ر.س
                            </span>
                          </div>
                        }
                        description={a.description_ar}
                      />
                    ),
                )}
              </div>
            </div>

            {/* All addons accordion (progressive disclosure) */}
            <div className="card">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="w-full flex items-center justify-between text-right group"
              >
                <div>
                  <div className="font-bold text-base">
                    شف كل الإضافات
                    <span className="text-[var(--brand)] font-mono text-sm ms-2">
                      ({ADDONS.length - 1})
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-faint)] mt-1">
                    مذكرات، ZATCA، AI، تكاملات حكومية، وأكثر
                  </div>
                </div>
                <span
                  className={`text-[var(--brand)] text-2xl transition-transform ${
                    showAll ? "rotate-180" : ""
                  }`}
                >
                  ↓
                </span>
              </button>

              {showAll && (
                <div className="mt-6 space-y-6">
                  {CATEGORY_ORDER.map((cat) => {
                    const items = ADDONS.filter(
                      (a) =>
                        a.category === cat.key &&
                        a.price_monthly_sar > 0 &&
                        !FEATURED_ADDON_KEYS.includes(a.key) &&
                        a.key !== "core_cases",
                    );
                    if (!items.length) return null;
                    return (
                      <div key={cat.key}>
                        <div className="flex items-center gap-2 mb-3">
                          <span>{cat.icon}</span>
                          <span className="font-bold text-sm">{cat.label_ar}</span>
                          <span className="text-[10px] text-[var(--text-faint)]">
                            ({items.length})
                          </span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2.5">
                          {items.map((a) => (
                            <Checkbox
                              key={a.key}
                              size="sm"
                              checked={selected.has(a.key)}
                              onChange={(v) => handleToggle(a.key, v)}
                              label={
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm">{a.name_ar}</span>
                                  <span className="text-[var(--brand)] font-mono text-xs num">
                                    +{a.price_monthly_sar}
                                  </span>
                                </div>
                              }
                              description={
                                <span className="text-[11px]">{a.description_ar}</span>
                              }
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ─── Right: sticky price panel ─── */}
          <PricePanel
            result={result}
            seats={seats}
            cycle={cycle}
            switchToBundle={switchToBundle}
            autoNote={autoNote}
          />
        </div>
      </div>
    </section>
  );
}

interface PricePanelProps {
  result: ReturnType<typeof compute>;
  seats: number;
  cycle: BillingCycle;
  switchToBundle: (k: string) => void;
  autoNote: string[];
}

function PricePanel({ result, seats, cycle, switchToBundle, autoNote }: PricePanelProps) {
  const { breakdown, suggestedBundle, savingsVsBundle } = result;
  const showPerSeat = seats > 1;

  return (
    <div className="lg:sticky lg:top-24 space-y-3">
      <div className="card border-[var(--brand-deep)] bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-elev)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono text-[var(--brand)] uppercase tracking-widest">
            // إجماليك المباشر
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
        </div>

        {/* Big number */}
        <div className="mb-1">
          {showPerSeat && (
            <div className="text-xs text-[var(--text-muted)] mb-1">
              <span className="num font-bold text-[var(--text)]">
                {breakdown.perSeatPerMonth}
              </span>{" "}
              ر.س / مستخدم / شهر
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-black text-5xl sm:text-6xl num leading-none">
              {breakdown.monthlyTotal}
            </span>
            <span className="text-[var(--text-muted)] text-lg">ر.س</span>
          </div>
          <div className="text-xs text-[var(--text-faint)] mt-1">
            في الشهر
            {cycle === "annual" && breakdown.discountAmount > 0 && (
              <>
                {" • "}
                <span className="text-[var(--brand)]">
                  وفّرت {breakdown.discountAmount} ر.س سنوياً
                </span>
              </>
            )}
          </div>
        </div>

        {/* Annual equivalent */}
        {cycle === "annual" && (
          <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] rounded px-3 py-2 mt-3 border border-[var(--border)]">
            <span className="num font-bold">{breakdown.annualTotal}</span> ر.س سنوياً • يعني شهرين مجاناً
          </div>
        )}

        {/* Auto-changes note */}
        {autoNote.length > 0 && (
          <div className="text-[11px] text-[var(--brand)] font-mono mt-3 space-y-1">
            {autoNote.map((n, i) => (
              <div key={i}>// {n}</div>
            ))}
          </div>
        )}

        {/* Bundle suggestion */}
        {suggestedBundle && savingsVsBundle > 30 && (
          <button
            type="button"
            onClick={() => switchToBundle(suggestedBundle.key)}
            className="w-full text-right mt-4 p-3 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30 hover:bg-[var(--accent)]/15 transition-colors"
          >
            <div className="text-[11px] text-[var(--accent)] font-mono mb-1">
              // لقطة
            </div>
            <div className="text-sm font-bold mb-0.5">
              باقة {suggestedBundle.name_ar} أرخص لك
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              توفّر <span className="text-[var(--accent)] font-bold">{savingsVsBundle} ر.س</span>{" "}
              شهرياً — اضغط لتفعيلها
            </div>
          </button>
        )}

        {/* Breakdown */}
        {breakdown.lineItems.length > 1 && (
          <details className="mt-4 group">
            <summary className="text-xs text-[var(--text-muted)] cursor-pointer list-none flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform">›</span>
              تفاصيل الحسبة ({breakdown.lineItems.length} عناصر)
            </summary>
            <ul className="mt-3 space-y-1.5 text-xs">
              {breakdown.lineItems.map((li, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-1 border-b border-[var(--border)] last:border-0"
                >
                  <span className="text-[var(--text-muted)] flex-1 truncate ms-2">
                    {li.label}
                  </span>
                  <span className="font-mono text-[var(--text)] num shrink-0">
                    {li.amount} ر.س
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* CTA */}
        <Link href="/signup" className="btn btn-brand w-full mt-5 text-base py-3.5">
          ابدأ تجربة 14 يوم — بدون بطاقة
          <span className="arrow-flip">→</span>
        </Link>
        <div className="text-[10px] text-center text-[var(--text-faint)] mt-2">
          ما راح نسحب فلوس. ما راح نطلب فيزا. ما راح نطنّش.
        </div>

        {/* Payment methods */}
        <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-[var(--border)] text-[10px] text-[var(--text-faint)]">
          <span>مدى</span>
          <span>•</span>
          <span>Apple Pay</span>
          <span>•</span>
          <span>STC Pay</span>
          <span>•</span>
          <span>Visa</span>
        </div>
      </div>

      <div className="text-[10px] text-center text-[var(--text-faint)] font-mono px-3">
        // 200+ مكتب على قائمة الانتظار. كن من الأوائل.
      </div>
    </div>
  );
}
