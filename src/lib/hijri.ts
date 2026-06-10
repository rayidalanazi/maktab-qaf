/**
 * Hijri (Umm al-Qura) date helpers for قاف.
 *
 * Uses the platform-native Intl `islamic-umalqura` calendar — the OFFICIAL
 * Saudi calendar (أم القرى) used by courts, Najiz, and government. No external
 * library needed; supported by modern browsers and Node 18+.
 */

const HIJRI_LOCALE = "ar-SA-u-ca-islamic-umalqura";

/** Parse a "YYYY-MM-DD" string or Date into a Date (UTC-safe at noon to avoid TZ slips). */
function toDate(input: string | Date): Date | null {
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (!input || input === "-") return null;
  // Accept YYYY-MM-DD; build at local noon to avoid off-by-one from timezones.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a Gregorian date as a full Hijri date in Arabic.
 * e.g. "٢٧ ذو القعدة ١٤٤٧ هـ"
 */
export function formatHijri(
  input: string | Date,
  opts: { weekday?: boolean; withEra?: boolean } = {},
): string {
  const d = toDate(input);
  if (!d) return "—";
  const fmt = new Intl.DateTimeFormat(HIJRI_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(opts.weekday ? { weekday: "long" } : {}),
  });
  const s = fmt.format(d);
  // Intl already appends هـ for ar-SA; ensure it's present when asked.
  if (opts.withEra && !s.includes("هـ")) return `${s} هـ`;
  return s;
}

/**
 * Short Hijri: "٢٧/١١/١٤٤٧".
 */
export function formatHijriShort(input: string | Date): string {
  const d = toDate(input);
  if (!d) return "—";
  return new Intl.DateTimeFormat(HIJRI_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Dual display: Hijri (primary) + Gregorian (secondary).
 * Returns the parts so the UI can style them.
 */
export function dualDate(input: string | Date): { hijri: string; gregorian: string } {
  const d = toDate(input);
  if (!d) return { hijri: "—", gregorian: "—" };
  return {
    hijri: formatHijri(d, { withEra: true }),
    gregorian: new Intl.DateTimeFormat("en-CA").format(d), // YYYY-MM-DD
  };
}

/** Today, both calendars + weekday. */
export function todayDual(now: Date = new Date()): {
  hijri: string;
  hijriWeekday: string;
  gregorian: string;
} {
  return {
    hijri: formatHijri(now, { withEra: true }),
    hijriWeekday: new Intl.DateTimeFormat(HIJRI_LOCALE, { weekday: "long" }).format(now),
    gregorian: new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now),
  };
}
