/**
 * Signup wizard validation + helpers.
 * Reflects the security/UX patterns surfaced by the design workflow:
 *   - reserved slugs (block well-known + sensitive names)
 *   - real-time subdomain availability (mock for now → API later)
 *   - Saudi phone normalization (multiple input formats → +9665XXXXXXXX)
 *   - constant-time semantics (responses shouldn't reveal whether an email exists)
 */

const RESERVED_SLUGS = new Set([
  // Infra
  "www", "api", "admin", "app", "mail", "ftp", "smtp", "imap", "ns1", "ns2",
  // Brand
  "qaf", "maktab", "law", "office", "lawfirm", "support", "help", "docs",
  "blog", "status", "billing", "payments", "dashboard", "panel",
  // Roles / sensitive
  "test", "staging", "dev", "demo", "root", "user", "admin1", "admins",
  // Government / regulatory
  "mol", "moj", "nazaha", "nafath", "absher", "najiz", "maaroof",
  // Generic Saudi terms
  "almamlaka", "ksa", "sa", "saudi", "saudi-arabia",
]);

const SUBDOMAIN_RE = /^[a-z][a-z0-9-]{1,28}[a-z0-9]$/;
const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

export type SubdomainStatus =
  | "idle"
  | "checking"
  | "available"
  | "invalid"
  | "reserved"
  | "taken"
  | "error";

export function validateSubdomain(slug: string): {
  status: Extract<SubdomainStatus, "idle" | "invalid" | "reserved">;
  reason?: string;
} {
  if (!slug) return { status: "idle" };
  if (!SUBDOMAIN_RE.test(slug)) {
    return {
      status: "invalid",
      reason: "النطاق بالإنجليزي بس، بدون مسافات أو رموز. // raed نعم، رائد لا",
    };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { status: "reserved", reason: "هذا الاسم محجوز للنظام. اختر غيره." };
  }
  return { status: "idle" };
}

/**
 * Mocked availability check. Will hit /api/subdomain/check later.
 * For now: anything matching pattern + not reserved + not in a tiny fake-taken list = available.
 */
const FAKE_TAKEN = new Set(["raed", "alfaisal", "tahakum", "rashed", "alrajhi"]);
export async function checkSubdomainAvailability(
  slug: string,
  signal?: AbortSignal,
): Promise<{ status: SubdomainStatus; suggestions?: string[] }> {
  await new Promise((r) => setTimeout(r, 350));
  if (signal?.aborted) throw new Error("aborted");
  const local = validateSubdomain(slug);
  if (local.status !== "idle") return { status: local.status };
  if (FAKE_TAKEN.has(slug)) {
    return {
      status: "taken",
      suggestions: [`${slug}-law`, `${slug}-sa`, `${slug}-legal`].slice(0, 3),
    };
  }
  return { status: "available" };
}

export function validateEmail(email: string): { ok: boolean; reason?: string } {
  if (!email) return { ok: false, reason: "البريد مطلوب." };
  if (!EMAIL_RE.test(email)) return { ok: false, reason: "هذا الإيميل شكله مكسور. تأكد منه." };
  return { ok: true };
}

export function validatePassword(pw: string): { ok: boolean; reason?: string; strength: number } {
  const strength =
    (pw.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(pw) ? 1 : 0) +
    (/\d/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);

  if (pw.length < 8) {
    return { ok: false, reason: "8 خانات على الأقل.", strength };
  }
  if (!/[A-Z]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) {
    return {
      ok: false,
      reason: "هذي كلمة سر تنكسر من بُعد. ضيف حرف كبير ورقم ورمز.",
      strength,
    };
  }
  return { ok: true, strength };
}

export function validateFullName(name: string): { ok: boolean; reason?: string } {
  if (name.trim().length < 2) return { ok: false, reason: "اسمك قصير شوي." };
  if (name.trim().length > 80) return { ok: false, reason: "الاسم طويل (80 حرف كحد أقصى)." };
  return { ok: true };
}

export function validateFirmNameAr(name: string): { ok: boolean; reason?: string } {
  if (name.trim().length < 2) return { ok: false, reason: "اسم المكتب قصير شوي. اكتبه كامل." };
  if (name.trim().length > 120) return { ok: false, reason: "الاسم طويل (120 حرف كحد أقصى)." };
  return { ok: true };
}

/**
 * Normalize Saudi phone to E.164: +9665XXXXXXXX.
 * Accepts: 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX, 009665XXXXXXXX, with Arabic digits.
 */
export function normalizeSaudiPhone(input: string): string | null {
  if (!input) return null;
  // Convert Arabic-Indic + Eastern Arabic digits → Latin
  const latin = input.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const digits = latin.replace(/\D/g, "");
  let body: string;
  if (digits.startsWith("00966")) body = digits.slice(5);
  else if (digits.startsWith("966")) body = digits.slice(3);
  else if (digits.startsWith("05")) body = digits.slice(1);
  else if (digits.startsWith("5") && digits.length === 9) body = digits;
  else if (digits.length === 9 && digits.startsWith("5")) body = digits;
  else return null;
  if (body.length !== 9 || !body.startsWith("5")) return null;
  return `+966${body}`;
}

export function suggestSubdomainFromFirmName(firmName: string): string {
  // Very simple translit-like fallback. Will be improved server-side later.
  const t = firmName
    .toLowerCase()
    .replace(/[ًٌٍَُِّْ]/g, "")
    .replace(/[إأآا]/g, "a")
    .replace(/[ب]/g, "b")
    .replace(/[ت]/g, "t")
    .replace(/[ث]/g, "th")
    .replace(/[ج]/g, "j")
    .replace(/[ح]/g, "h")
    .replace(/[خ]/g, "kh")
    .replace(/[د]/g, "d")
    .replace(/[ذ]/g, "dh")
    .replace(/[ر]/g, "r")
    .replace(/[ز]/g, "z")
    .replace(/[س]/g, "s")
    .replace(/[ش]/g, "sh")
    .replace(/[ص]/g, "s")
    .replace(/[ض]/g, "d")
    .replace(/[ط]/g, "t")
    .replace(/[ظ]/g, "z")
    .replace(/[ع]/g, "a")
    .replace(/[غ]/g, "gh")
    .replace(/[ف]/g, "f")
    .replace(/[ق]/g, "q")
    .replace(/[ك]/g, "k")
    .replace(/[ل]/g, "l")
    .replace(/[م]/g, "m")
    .replace(/[ن]/g, "n")
    .replace(/[ه]/g, "h")
    .replace(/[و]/g, "w")
    .replace(/[ي]/g, "y")
    .replace(/[ة]/g, "")
    .replace(/[^a-z0-9\s\-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  return t;
}
