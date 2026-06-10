/**
 * Shared types for قاف pricing model.
 * Populated from the workflow output once it returns.
 */

export interface AddonCategory {
  key: string;
  label_ar: string;
  icon: string;
  order: number;
}

export interface Addon {
  key: string;
  category: string;
  name_ar: string;
  description_ar: string;
  price_monthly_sar: number;
  snark_ar: string;
  unlocks_pages: string[];
  requires: string[];
}

export interface Bundle {
  key: string;
  name_ar: string;
  tagline_ar: string;
  price_monthly_sar: number;
  included_addon_keys: string[];
  user_seats: string;
  target_audience_ar: string;
  is_recommended: boolean;
  savings_vs_individual_sar: number;
}

export interface PricingCatalog {
  categories: AddonCategory[];
  addons: Addon[];
  bundles: Bundle[];
  free_trial_days: number;
  annual_discount_pct: number;
  design_principles: string[];
}

export type BillingCycle = "monthly" | "annual";

export interface CalculatorState {
  cycle: BillingCycle;
  selectedBundleKey: string | null;
  selectedAddonKeys: Set<string>;
  extraSeats: number;
  extraStorageGB: number;
}

export interface PriceBreakdown {
  bundleCost: number;
  addonsCost: number;
  seatsCost: number;
  storageCost: number;
  subtotal: number;
  discount: number;
  total: number;
  cycle: BillingCycle;
}
