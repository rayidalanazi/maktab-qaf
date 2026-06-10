/**
 * Mock data for the platform admin dashboard.
 * Once Supabase is connected, these come from the tenants / subscriptions /
 * payments / users tables (restricted to platform_admin role).
 */

export const ADMIN_TENANTS = [
  { id: 1, slug: "raed", name: "شركة رائد للمحاماة", plan: "متوسط", price: 499, status: "نشط", users: 8, signedUp: "2026-04-12", lastActive: "قبل ساعة", trial: false, mrr: 499 },
  { id: 2, slug: "alfaisal", name: "مكتب الفيصل للمحاماة", plan: "صغير", price: 199, status: "نشط", users: 3, signedUp: "2026-04-22", lastActive: "اليوم", trial: false, mrr: 199 },
  { id: 3, slug: "khoury", name: "مكتب الخوري للاستشارات", plan: "متوسط", price: 499, status: "نشط", users: 7, signedUp: "2026-05-01", lastActive: "قبل 3 ساعات", trial: false, mrr: 499 },
  { id: 4, slug: "alotaibi", name: "مؤسسة العتيبي القانونية", plan: "الأساس", price: 49, status: "تجربة", users: 1, signedUp: "2026-06-08", lastActive: "أمس", trial: true, mrr: 0 },
  { id: 5, slug: "almutairi", name: "مكتب المطيري للمحاماة", plan: "صغير", price: 199, status: "نشط", users: 2, signedUp: "2026-05-15", lastActive: "اليوم", trial: false, mrr: 199 },
  { id: 6, slug: "alharbi", name: "شركة الحربي القانونية", plan: "الأساس + إضافات", price: 196, status: "نشط", users: 2, signedUp: "2026-05-20", lastActive: "أمس", trial: false, mrr: 196 },
  { id: 7, slug: "alqahtani", name: "مكتب القحطاني", plan: "Enterprise", price: 1999, status: "نشط", users: 22, signedUp: "2026-03-01", lastActive: "قبل دقائق", trial: false, mrr: 1999 },
  { id: 8, slug: "demo-firm", name: "مكتب تجريبي", plan: "الأساس", price: 49, status: "تجربة", users: 1, signedUp: "2026-06-09", lastActive: "اليوم", trial: true, mrr: 0 },
  { id: 9, slug: "alshammari", name: "مكتب الشمري", plan: "متوسط", price: 499, status: "متأخر دفع", users: 4, signedUp: "2026-02-18", lastActive: "قبل 5 أيام", trial: false, mrr: 0 },
  { id: 10, slug: "alanazi", name: "مكتب العنزي للمحاماة", plan: "صغير", price: 199, status: "نشط", users: 3, signedUp: "2026-04-30", lastActive: "اليوم", trial: false, mrr: 199 },
];

export const ADMIN_REVENUE_BY_MONTH = [
  { month: "01", mrr: 3200, new_signups: 4, churned: 0 },
  { month: "02", mrr: 4100, new_signups: 5, churned: 1 },
  { month: "03", mrr: 5800, new_signups: 7, churned: 1 },
  { month: "04", mrr: 7100, new_signups: 8, churned: 2 },
  { month: "05", mrr: 8900, new_signups: 6, churned: 1 },
  { month: "06", mrr: 10200, new_signups: 4, churned: 0 },
];

export const ADMIN_RECENT_EVENTS = [
  { id: 1, kind: "signup", tenant: "demo-firm", desc: "اشترك في تجربة الأساس", time: "قبل 12 دقيقة", ic: "🎉" },
  { id: 2, kind: "upgrade", tenant: "alfaisal", desc: "ترقّى من الأساس إلى صغير", time: "قبل ساعة", ic: "⬆" },
  { id: 3, kind: "payment", tenant: "raed", desc: "دفع 499 ر.س — تجديد شهري", time: "قبل ساعتين", ic: "💰" },
  { id: 4, kind: "support", tenant: "alshammari", desc: "تذكرة دعم: استفسار حول الفوترة", time: "قبل 3 ساعات", ic: "🎫" },
  { id: 5, kind: "addon", tenant: "alharbi", desc: "اشترى إضافة المذكرات (+49)", time: "أمس 16:30", ic: "🧩" },
  { id: 6, kind: "cancel", tenant: "alqahtani", desc: "ألغى إضافة AI", time: "أمس 14:00", ic: "❌" },
];

export const ADMIN_SUPPORT_TICKETS = [
  { id: 101, tenant: "alshammari", subject: "كيف أنزّل لباقة أصغر؟", status: "جديد", priority: "متوسطة", opened: "قبل 3 ساعات" },
  { id: 102, tenant: "khoury", subject: "مشكلة في رفع ملف PDF كبير", status: "قيد الحل", priority: "عالية", opened: "أمس" },
  { id: 103, tenant: "alotaibi", subject: "هل تدعمون نفاذ؟", status: "تم الرد", priority: "منخفضة", opened: "أمس" },
];

/* ============================================================
   ALL USERS across every tenant — for the global users page.
   ============================================================ */
export type AdminUser = {
  id: number;
  name: string;
  email: string;
  tenantSlug: string;
  tenantName: string;
  role: string;        // Arabic role label
  roleKey: string;     // admin|lawyer|accountant|...
  status: "نشط" | "معطل" | "مدعو";
  lastLogin: string;
  mfa: boolean;
  createdAt: string;
};

export const ADMIN_USERS: AdminUser[] = [
  // raed
  { id: 1, name: "عبدالله العتيبي", email: "admin@raed-law.sa", tenantSlug: "raed", tenantName: "شركة رائد للمحاماة", role: "مدير النظام", roleKey: "admin", status: "نشط", lastLogin: "قبل ساعة", mfa: true, createdAt: "2026-04-12" },
  { id: 2, name: "محمد الفهيد", email: "mohamed@raed-law.sa", tenantSlug: "raed", tenantName: "شركة رائد للمحاماة", role: "محامي مساعد", roleKey: "lawyer", status: "نشط", lastLogin: "اليوم 08:30", mfa: false, createdAt: "2026-04-13" },
  { id: 3, name: "فاطمة الصالح", email: "fatima@raed-law.sa", tenantSlug: "raed", tenantName: "شركة رائد للمحاماة", role: "محامية", roleKey: "lawyer", status: "نشط", lastLogin: "أمس 16:45", mfa: true, createdAt: "2026-04-14" },
  { id: 4, name: "ريم العبدلي", email: "manager@raed-law.sa", tenantSlug: "raed", tenantName: "شركة رائد للمحاماة", role: "مدير القضايا", roleKey: "manager", status: "نشط", lastLogin: "اليوم 08:50", mfa: false, createdAt: "2026-04-15" },
  { id: 5, name: "هند الراشد", email: "secretary@raed-law.sa", tenantSlug: "raed", tenantName: "شركة رائد للمحاماة", role: "سكرتارية", roleKey: "secretary", status: "نشط", lastLogin: "اليوم 08:00", mfa: false, createdAt: "2026-04-16" },
  // alfaisal
  { id: 6, name: "خالد الفيصل", email: "admin@alfaisal-law.sa", tenantSlug: "alfaisal", tenantName: "مكتب الفيصل للمحاماة", role: "مدير النظام", roleKey: "admin", status: "نشط", lastLogin: "اليوم", mfa: true, createdAt: "2026-04-22" },
  { id: 7, name: "سعد الدوسري", email: "saad@alfaisal-law.sa", tenantSlug: "alfaisal", tenantName: "مكتب الفيصل للمحاماة", role: "محامي", roleKey: "lawyer", status: "نشط", lastLogin: "أمس", mfa: false, createdAt: "2026-04-23" },
  { id: 8, name: "نوال العتيبي", email: "auditor@alfaisal-law.sa", tenantSlug: "alfaisal", tenantName: "مكتب الفيصل للمحاماة", role: "مدقق", roleKey: "auditor", status: "معطل", lastLogin: "قبل 8 أيام", mfa: false, createdAt: "2026-04-25" },
  // khoury
  { id: 9, name: "إيلي الخوري", email: "admin@khoury.sa", tenantSlug: "khoury", tenantName: "مكتب الخوري للاستشارات", role: "مدير النظام", roleKey: "admin", status: "نشط", lastLogin: "قبل 3 ساعات", mfa: true, createdAt: "2026-05-01" },
  { id: 10, name: "ليان السبيعي", email: "consultant@khoury.sa", tenantSlug: "khoury", tenantName: "مكتب الخوري للاستشارات", role: "مستشار", roleKey: "consultant", status: "نشط", lastLogin: "اليوم", mfa: false, createdAt: "2026-05-03" },
  { id: 11, name: "ماجد القرني", email: "accountant@khoury.sa", tenantSlug: "khoury", tenantName: "مكتب الخوري للاستشارات", role: "محاسب", roleKey: "accountant", status: "نشط", lastLogin: "أمس", mfa: true, createdAt: "2026-05-05" },
  // alotaibi (trial)
  { id: 12, name: "تركي العتيبي", email: "admin@alotaibi.sa", tenantSlug: "alotaibi", tenantName: "مؤسسة العتيبي القانونية", role: "مدير النظام", roleKey: "admin", status: "نشط", lastLogin: "أمس", mfa: false, createdAt: "2026-06-08" },
  // almutairi
  { id: 13, name: "بدر المطيري", email: "admin@almutairi.sa", tenantSlug: "almutairi", tenantName: "مكتب المطيري للمحاماة", role: "مدير النظام", roleKey: "admin", status: "نشط", lastLogin: "اليوم", mfa: true, createdAt: "2026-05-15" },
  { id: 14, name: "عبير الزهراني", email: "lawyer@almutairi.sa", tenantSlug: "almutairi", tenantName: "مكتب المطيري للمحاماة", role: "محامية", roleKey: "lawyer", status: "نشط", lastLogin: "أمس", mfa: false, createdAt: "2026-05-16" },
  // alharbi
  { id: 15, name: "فهد الحربي", email: "admin@alharbi.sa", tenantSlug: "alharbi", tenantName: "شركة الحربي القانونية", role: "مدير النظام", roleKey: "admin", status: "نشط", lastLogin: "أمس", mfa: false, createdAt: "2026-05-20" },
  { id: 16, name: "ريما الحربي", email: "marketer@alharbi.sa", tenantSlug: "alharbi", tenantName: "شركة الحربي القانونية", role: "مسوقة", roleKey: "marketer", status: "نشط", lastLogin: "قبل يومين", mfa: false, createdAt: "2026-05-21" },
  // alqahtani (enterprise — many)
  { id: 17, name: "سلطان القحطاني", email: "admin@alqahtani.sa", tenantSlug: "alqahtani", tenantName: "مكتب القحطاني", role: "مدير النظام", roleKey: "admin", status: "نشط", lastLogin: "قبل دقائق", mfa: true, createdAt: "2026-03-01" },
  { id: 18, name: "منصور الشهري", email: "partner@alqahtani.sa", tenantSlug: "alqahtani", tenantName: "مكتب القحطاني", role: "شريك", roleKey: "partner", status: "نشط", lastLogin: "اليوم", mfa: true, createdAt: "2026-03-02" },
  { id: 19, name: "غادة المالكي", email: "gm@alqahtani.sa", tenantSlug: "alqahtani", tenantName: "مكتب القحطاني", role: "مدير عام", roleKey: "general_manager", status: "نشط", lastLogin: "اليوم", mfa: true, createdAt: "2026-03-02" },
  { id: 20, name: "يوسف الغامدي", email: "lawyer1@alqahtani.sa", tenantSlug: "alqahtani", tenantName: "مكتب القحطاني", role: "محامي", roleKey: "lawyer", status: "نشط", lastLogin: "أمس", mfa: false, createdAt: "2026-03-05" },
  // demo-firm (trial)
  { id: 21, name: "مستخدم تجريبي", email: "demo@demo-firm.sa", tenantSlug: "demo-firm", tenantName: "مكتب تجريبي", role: "مدير النظام", roleKey: "admin", status: "نشط", lastLogin: "اليوم", mfa: false, createdAt: "2026-06-09" },
  // alshammari (past_due)
  { id: 22, name: "ناصر الشمري", email: "admin@alshammari.sa", tenantSlug: "alshammari", tenantName: "مكتب الشمري", role: "مدير النظام", roleKey: "admin", status: "نشط", lastLogin: "قبل 5 أيام", mfa: false, createdAt: "2026-02-18" },
  { id: 23, name: "أمل الشمري", email: "accountant@alshammari.sa", tenantSlug: "alshammari", tenantName: "مكتب الشمري", role: "محاسبة", roleKey: "accountant", status: "نشط", lastLogin: "قبل 6 أيام", mfa: false, createdAt: "2026-02-20" },
  // alanazi
  { id: 24, name: "رايد العنزي", email: "admin@alanazi.sa", tenantSlug: "alanazi", tenantName: "مكتب العنزي للمحاماة", role: "مدير النظام", roleKey: "admin", status: "نشط", lastLogin: "اليوم", mfa: true, createdAt: "2026-04-30" },
  { id: 25, name: "سارة العنزي", email: "lawyer@alanazi.sa", tenantSlug: "alanazi", tenantName: "مكتب العنزي للمحاماة", role: "محامية", roleKey: "lawyer", status: "مدعو", lastLogin: "—", mfa: false, createdAt: "2026-06-09" },
];

/* ============================================================
   GRANTS — free features / upgrades the admin gifted, time-boxed.
   ============================================================ */
export type AdminGrant = {
  id: number;
  tenantSlug: string;
  tenantName: string;
  type: "free_addon" | "free_upgrade" | "extended_trial" | "discount" | "comp_seats";
  label: string;        // human label of what was granted
  startsAt: string;
  expiresAt: string | null; // null = permanent comp
  daysLeft: number | null;
  status: "نشط" | "قارب الانتهاء" | "منتهٍ";
  autoConvert: boolean; // convert to paid on expiry
  reason: string;
  grantedBy: string;
};

export const ADMIN_GRANTS: AdminGrant[] = [
  { id: 1, tenantSlug: "alfaisal", tenantName: "مكتب الفيصل للمحاماة", type: "free_addon", label: "المذكرات (مجاناً)", startsAt: "2026-06-01", expiresAt: "2026-07-01", daysLeft: 21, status: "نشط", autoConvert: true, reason: "ترويج — تجربة ميزة المذكرات", grantedBy: "أنت" },
  { id: 2, tenantSlug: "alotaibi", tenantName: "مؤسسة العتيبي القانونية", type: "extended_trial", label: "تمديد التجربة 14 يوم", startsAt: "2026-06-08", expiresAt: "2026-06-22", daysLeft: 12, status: "نشط", autoConvert: false, reason: "العميل طلب وقت إضافي للتقييم", grantedBy: "أنت" },
  { id: 3, tenantSlug: "khoury", tenantName: "مكتب الخوري للاستشارات", type: "free_upgrade", label: "ترقية لـ Enterprise (تجربة)", startsAt: "2026-06-05", expiresAt: "2026-06-12", daysLeft: 2, status: "قارب الانتهاء", autoConvert: true, reason: "إقناع بالترقية قبل التجديد", grantedBy: "أنت" },
  { id: 4, tenantSlug: "almutairi", tenantName: "مكتب المطيري للمحاماة", type: "discount", label: "خصم 25% لـ 3 أشهر", startsAt: "2026-05-15", expiresAt: "2026-08-15", daysLeft: 66, status: "نشط", autoConvert: false, reason: "عميل مبكّر — عرض إطلاق", grantedBy: "أنت" },
  { id: 5, tenantSlug: "alharbi", tenantName: "شركة الحربي القانونية", type: "comp_seats", label: "3 مقاعد مجانية (دائم)", startsAt: "2026-05-20", expiresAt: null, daysLeft: null, status: "نشط", autoConvert: false, reason: "شريك إحالة", grantedBy: "أنت" },
];

/* Per-tenant enabled addon keys (for the tenant detail page). */
export const ADMIN_TENANT_ADDONS: Record<string, string[]> = {
  raed: ["core_cases", "case_timeline_plus", "memos_module", "templates_library", "schedule_attendance", "documents_vault", "invoicing_pro", "reports_basic"],
  alfaisal: ["core_cases", "schedule_attendance", "documents_vault", "memos_module"],
  khoury: ["core_cases", "memos_module", "invoicing_pro", "reports_basic", "kpi_dashboard"],
  alotaibi: ["core_cases"],
  almutairi: ["core_cases", "schedule_attendance", "documents_vault"],
  alharbi: ["core_cases", "memos_module"],
  alqahtani: ["core_cases", "case_timeline_plus", "memos_module", "templates_library", "precedents_engine", "regulations_hub", "schedule_attendance", "documents_vault", "invoicing_pro", "reports_basic", "kpi_dashboard", "executive_suite", "ai_assistant"],
  "demo-firm": ["core_cases"],
  alshammari: ["core_cases", "memos_module", "invoicing_pro"],
  alanazi: ["core_cases", "schedule_attendance", "documents_vault"],
};

/* Per-tenant recent activity (for tenant detail timeline). */
export const ADMIN_TENANT_ACTIVITY: Record<string, { ts: string; text: string; ic: string }[]> = {
  raed: [
    { ts: "قبل ساعة", text: "دخول المدير عبدالله العتيبي", ic: "🔑" },
    { ts: "أمس 14:30", text: "دفع فاتورة 499 ر.س — تجديد", ic: "💰" },
    { ts: "قبل 3 أيام", text: "أضاف مستخدماً جديداً (فاطمة)", ic: "👤" },
    { ts: "قبل أسبوع", text: "ترقّى من صغير إلى متوسط", ic: "⬆" },
  ],
};

