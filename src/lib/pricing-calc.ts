/**
 * Pricing calculator logic — pure functions, no React.
 *
 * Dependency-graph resolution + dependency-aware removals + bundle suggestion
 * + payback computation.
 */

import {
  ADDONS,
  BUNDLES,
  EXTRA_SEAT_PRICE,
  ANNUAL_DISCOUNT_PCT,
  getAddon,
  getBundle,
} from "@/data/pricing";
import type { Addon, Bundle, BillingCycle } from "@/types/pricing";

/**
 * Build the transitive set of addons required by a given addon.
 * e.g. requires "reports_basic" → also need its requires, recursively.
 */
export function transitiveRequires(addonKey: string, visited = new Set<string>()): Set<string> {
  if (visited.has(addonKey)) return visited;
  visited.add(addonKey);
  const a = getAddon(addonKey);
  if (!a) return visited;
  for (const req of a.requires) transitiveRequires(req, visited);
  return visited;
}

/**
 * Find all addons that DEPEND on the given key (would break if it's removed).
 */
export function dependentsOf(addonKey: string, selected: Set<string>): string[] {
  const out: string[] = [];
  for (const k of selected) {
    if (k === addonKey) continue;
    const a = getAddon(k);
    if (!a) continue;
    if (transitiveRequires(k).has(addonKey)) out.push(k);
  }
  return out;
}

/**
 * Compute the price of a set of addon keys (excluding free ones).
 */
export function sumAddonPrices(keys: Iterable<string>): number {
  let total = 0;
  for (const k of keys) {
    const a = getAddon(k);
    if (a) total += a.price_monthly_sar;
  }
  return total;
}

export interface CalculatorInput {
  cycle: BillingCycle;
  mode: "custom" | "bundle";
  bundleKey: string | null;
  customAddonKeys: Set<string>;
  seats: number; // total seats (1 included free in base)
  extraStorageBundles: number; // count of extra_storage_5gb
}

export interface PriceBreakdown {
  basePrice: number;
  addonsPrice: number;
  seatsPrice: number;
  storagePrice: number;
  subtotalMonthly: number;
  discountAmount: number;
  monthlyTotal: number;
  annualTotal: number;
  effectiveMonthlyAmortized: number; // if annual, monthly equivalent
  perSeatPerMonth: number;
  cycle: BillingCycle;
  lineItems: { label: string; amount: number; meta?: string }[];
}

export interface CalculatorResult {
  breakdown: PriceBreakdown;
  suggestedBundle: Bundle | null;
  savingsVsBundle: number;
  effectiveAddonKeys: string[];
  /** Bundle addons that user-selected addons should match (so we can pre-fill). */
  bundleIncludedAddons: string[];
}

/**
 * Compute everything.
 */
export function compute(input: CalculatorInput): CalculatorResult {
  const lineItems: PriceBreakdown["lineItems"] = [];
  let basePrice = 0;
  let addonsPrice = 0;
  let bundleIncludedAddons: string[] = [];
  let effectiveAddonKeys: string[] = [];

  if (input.mode === "bundle" && input.bundleKey) {
    const b = getBundle(input.bundleKey);
    if (b) {
      basePrice = b.price_monthly_sar;
      bundleIncludedAddons = b.included_addon_keys;
      effectiveAddonKeys = b.included_addon_keys;
      lineItems.push({ label: `باقة ${b.name_ar}`, amount: b.price_monthly_sar });
    }
  } else {
    basePrice = 49; // base subscription
    lineItems.push({ label: "الاشتراك الأساسي", amount: 49 });

    // Resolve all selected + their transitive requires
    const resolved = new Set<string>();
    for (const k of input.customAddonKeys) {
      for (const r of transitiveRequires(k)) resolved.add(r);
    }
    // Exclude free addons (core_cases)
    for (const k of resolved) {
      const a = getAddon(k);
      if (a && a.price_monthly_sar > 0) {
        addonsPrice += a.price_monthly_sar;
        lineItems.push({ label: a.name_ar, amount: a.price_monthly_sar });
      }
    }
    effectiveAddonKeys = Array.from(resolved);
  }

  // Seats — first seat included
  const extraSeats = Math.max(0, input.seats - 1);
  const seatsPrice = extraSeats * EXTRA_SEAT_PRICE;
  if (seatsPrice > 0) {
    lineItems.push({
      label: `${extraSeats} مستخدم إضافي`,
      amount: seatsPrice,
      meta: `× ${EXTRA_SEAT_PRICE} ر.س`,
    });
  }

  // Extra storage
  const storagePrice = input.extraStorageBundles * 19;
  if (storagePrice > 0) {
    lineItems.push({
      label: `${input.extraStorageBundles * 5} جيجا تخزين إضافي`,
      amount: storagePrice,
    });
  }

  const subtotalMonthly = basePrice + addonsPrice + seatsPrice + storagePrice;

  let discountAmount = 0;
  let monthlyTotal = subtotalMonthly;
  if (input.cycle === "annual") {
    discountAmount = Math.round((subtotalMonthly * 12 * ANNUAL_DISCOUNT_PCT) / 100);
    monthlyTotal = subtotalMonthly - Math.round(discountAmount / 12);
  }

  const annualTotal = monthlyTotal * 12;

  // Bundle suggestion: if custom cost >= 95% of a higher bundle, suggest it
  let suggestedBundle: Bundle | null = null;
  let savingsVsBundle = 0;
  if (input.mode === "custom") {
    for (const b of BUNDLES) {
      if (b.price_monthly_sar <= 49) continue; // skip base
      if (subtotalMonthly >= b.price_monthly_sar * 0.95) {
        // Would the bundle give us a better deal?
        const bundleCovers = b.included_addon_keys.length >= input.customAddonKeys.size;
        if (bundleCovers || b.price_monthly_sar < subtotalMonthly) {
          if (b.price_monthly_sar < subtotalMonthly) {
            suggestedBundle = b;
            savingsVsBundle = subtotalMonthly - b.price_monthly_sar;
            break;
          }
        }
      }
    }
  }

  return {
    breakdown: {
      basePrice,
      addonsPrice,
      seatsPrice,
      storagePrice,
      subtotalMonthly,
      discountAmount,
      monthlyTotal,
      annualTotal,
      effectiveMonthlyAmortized: monthlyTotal,
      perSeatPerMonth: input.seats > 0 ? Math.round(monthlyTotal / input.seats) : monthlyTotal,
      cycle: input.cycle,
      lineItems,
    },
    suggestedBundle,
    savingsVsBundle,
    effectiveAddonKeys,
    bundleIncludedAddons,
  };
}

/**
 * Verify bundle savings claims against the catalog (for the in-page validator).
 */
export function verifyBundleSavings(bundleKey: string): {
  claimed: number;
  computed: number;
  match: boolean;
} {
  const b = getBundle(bundleKey);
  if (!b) return { claimed: 0, computed: 0, match: true };
  const addonSum = sumAddonPrices(b.included_addon_keys);
  // Seats baseline: parse from user_seats string; default to 1
  const seatMatch = b.user_seats.match(/(\d+)/);
  const seats = seatMatch ? parseInt(seatMatch[1], 10) : 1;
  const seatsCost = Math.max(0, seats - 1) * EXTRA_SEAT_PRICE;
  // Base 49 always included for non-base bundle comparison
  const aLaCarte = 49 + addonSum + seatsCost;
  const computed = Math.max(0, aLaCarte - b.price_monthly_sar);
  return {
    claimed: b.savings_vs_individual_sar,
    computed,
    match: Math.abs(computed - b.savings_vs_individual_sar) <= 50, // tolerance
  };
}

/**
 * Toggle helper: addon on/off while honoring deps.
 * Returns the new set + an explanation of what auto-changed.
 */
export function toggleAddon(
  current: Set<string>,
  key: string,
  enabling: boolean,
): { next: Set<string>; autoChanges: string[] } {
  const next = new Set(current);
  const autoChanges: string[] = [];

  if (enabling) {
    next.add(key);
    // Also pull in all transitive requires that aren't already on
    for (const r of transitiveRequires(key)) {
      if (!current.has(r) && r !== key) {
        next.add(r);
        const a = getAddon(r);
        if (a) autoChanges.push(`أضفنا ${a.name_ar} لأنها مطلوبة`);
      }
    }
  } else {
    // Removing — also remove anything that depended on this one
    const deps = dependentsOf(key, current);
    next.delete(key);
    for (const d of deps) {
      next.delete(d);
      const a = getAddon(d);
      if (a) autoChanges.push(`شيلنا ${a.name_ar} لأنها تعتمد على المحذوف`);
    }
  }

  return { next, autoChanges };
}

/**
 * Encode calculator state to URL params (for the share link).
 */
export function encodeStateToParams(input: CalculatorInput): URLSearchParams {
  const p = new URLSearchParams();
  p.set("cycle", input.cycle);
  if (input.mode === "bundle" && input.bundleKey) p.set("bundle", input.bundleKey);
  if (input.mode === "custom") {
    const addons = Array.from(input.customAddonKeys);
    if (addons.length) p.set("addons", addons.join(","));
  }
  if (input.seats !== 1) p.set("seats", String(input.seats));
  if (input.extraStorageBundles > 0) p.set("storage", String(input.extraStorageBundles));
  return p;
}

export function decodeStateFromParams(p: URLSearchParams): CalculatorInput {
  const cycle = (p.get("cycle") === "annual" ? "annual" : "monthly") as BillingCycle;
  const bundleKey = p.get("bundle");
  const addonsParam = p.get("addons");
  const customAddonKeys = new Set(
    addonsParam ? addonsParam.split(",").filter(Boolean) : [],
  );
  const seats = Math.max(1, parseInt(p.get("seats") || "1", 10));
  const extraStorageBundles = Math.max(0, parseInt(p.get("storage") || "0", 10));

  return {
    cycle,
    mode: bundleKey ? "bundle" : "custom",
    bundleKey,
    customAddonKeys,
    seats,
    extraStorageBundles,
  };
}
