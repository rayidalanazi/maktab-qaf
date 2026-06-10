/**
 * Conditionally join classNames. Plain implementation, no deps.
 */
export function cn(...inputs: (string | false | null | undefined | Record<string, boolean>)[]): string {
  const out: string[] = [];
  for (const i of inputs) {
    if (!i) continue;
    if (typeof i === "string") {
      out.push(i);
    } else if (typeof i === "object") {
      for (const [k, v] of Object.entries(i)) if (v) out.push(k);
    }
  }
  return out.join(" ");
}

/**
 * Format SAR amount with Arabic-Indic digits (or Western, configurable).
 */
export function formatSAR(amount: number, opts: { digits?: "ar" | "en"; symbol?: boolean } = {}): string {
  const { digits = "en", symbol = true } = opts;
  const formatted = new Intl.NumberFormat(digits === "ar" ? "ar-SA" : "en-US", {
    maximumFractionDigits: 2,
  }).format(amount);
  return symbol ? `${formatted} ر.س` : formatted;
}

/**
 * Short money (e.g. 89000 → 89K, 1200000 → 1.2M)
 */
export function formatSARShort(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}م ر.س`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}ك ر.س`;
  return `${amount} ر.س`;
}

/**
 * Slug a string for use as tenant subdomain.
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Compute annual price from monthly with discount.
 */
export function annualFromMonthly(monthly: number, discountPct: number): number {
  return Math.round(monthly * 12 * (1 - discountPct / 100));
}
