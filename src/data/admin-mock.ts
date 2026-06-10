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
