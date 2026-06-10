/**
 * Mock data for the app pages (cases, documents, schedule, etc.).
 * Mirrors the prototype's data shape so the UI can render meaningfully
 * before Supabase is connected.
 */

export const MOCK_CASES = [
  {
    id: 1, name: "2026/0142", court: "المحكمة العامة بالرياض", type: "تجاري",
    plaintiff: "شركة النجم التجارية", defendant: "محمد عبدالله الحربي",
    status: "نشط", action: "جلسة قادمة", deadline: "2026-05-25", risk: 2,
    assignedTo: "عبدالله العتيبي",
  },
  {
    id: 2, name: "2026/0099", court: "محكمة الأحوال الشخصية", type: "أحوال شخصية",
    plaintiff: "سارة أحمد القحطاني", defendant: "خالد سعد الدوسري",
    status: "نشط", action: "تقديم دفاع", deadline: "2026-05-12", risk: 3,
    assignedTo: "محمد الفهيد",
  },
  {
    id: 3, name: "2025/3201", court: "المحكمة العمالية", type: "عمالي",
    plaintiff: "عبدالرحمن خالد", defendant: "شركة البناء الذهبي",
    status: "معلق", action: "بانتظار الحكم", deadline: "2026-06-08", risk: 2,
    assignedTo: "محمد الفهيد",
  },
  {
    id: 4, name: "2026/0211", court: "المحكمة الجزائية", type: "جزائي",
    plaintiff: "النيابة العامة", defendant: "فهد محمد العسيري",
    status: "نشط", action: "تحضير المرافعة", deadline: "2026-05-30", risk: 4,
    assignedTo: "عبدالله العتيبي",
  },
  {
    id: 5, name: "2025/2890", court: "المحكمة التجارية", type: "تجاري",
    plaintiff: "مؤسسة الخليج الصناعية", defendant: "مصنع الأمجاد",
    status: "مغلق", action: "صدر الحكم", deadline: "2025-12-15", risk: 1,
    assignedTo: "عبدالله العتيبي",
  },
  {
    id: 6, name: "2026/0307", court: "محكمة التنفيذ بجدة", type: "تنفيذي",
    plaintiff: "بنك الراجحي", defendant: "شركة المنارة العقارية",
    status: "نشط", action: "تنفيذ الحكم", deadline: "2026-06-15", risk: 2,
    assignedTo: "محمد الفهيد",
  },
  {
    id: 7, name: "2026/0156", court: "المحكمة العامة بالدمام", type: "مدني",
    plaintiff: "يوسف إبراهيم العمر", defendant: "شركة المقاولات المتحدة",
    status: "نشط", action: "الاستئناف", deadline: "2026-05-18", risk: 3,
    assignedTo: "فاطمة الصالح",
  },
];

export const MOCK_DOCUMENTS = [
  { id: 1, name: "عقد توكيل - النجم التجارية", type: "PDF", size: "245 KB", case: "2026/0142", uploader: "عبدالله العتيبي", date: "2026-04-28" },
  { id: 2, name: "محضر جلسة 2026/0099", type: "PDF", size: "180 KB", case: "2026/0099", uploader: "محمد الفهيد", date: "2026-04-22" },
  { id: 3, name: "مذكرة دفاع", type: "DOCX", size: "95 KB", case: "2026/0099", uploader: "عبدالله العتيبي", date: "2026-05-02" },
  { id: 4, name: "صورة هوية الموكل", type: "JPG", size: "1.2 MB", case: "2026/0211", uploader: "نورة الحربي", date: "2026-05-01" },
  { id: 5, name: "حكم محكمة 2025/2890", type: "PDF", size: "312 KB", case: "2025/2890", uploader: "عبدالله العتيبي", date: "2025-11-20" },
  { id: 6, name: "عقد إيجار محل تجاري", type: "PDF", size: "445 KB", case: "2026/0156", uploader: "فاطمة الصالح", date: "2026-04-15" },
];

export const MOCK_EVENTS = [
  { id: 1, title: "جلسة قضية 2026/0142", date: "2026-05-15", time: "09:00", type: "جلسة", desc: "المحكمة العامة بالرياض - قاعة 3" },
  { id: 2, title: "اجتماع مع العميل سارة القحطاني", date: "2026-05-08", time: "11:00", type: "اجتماع", desc: "مكتب المحامي الرئيسي" },
  { id: 3, title: "تقديم دفاع - قضية 2026/0099", date: "2026-05-12", time: "08:00", type: "موعد نهائي", desc: "يجب التقديم قبل الساعة 12 ظهراً" },
  { id: 4, title: "مراجعة عقد توريد", date: "2026-05-10", time: "14:00", type: "مهمة", desc: "شركة النجم التجارية" },
  { id: 5, title: "جلسة قضية 2026/0211", date: "2026-05-18", time: "10:30", type: "جلسة", desc: "المحكمة الجزائية" },
];

export const MOCK_TASKS = [
  { id: 1, title: "تحضير مذكرة الدفاع لقضية 2026/0099", priority: "عالية", due: "2026-05-12", status: "in-progress" },
  { id: 2, title: "متابعة العميل بنك الراجحي للتحصيل", priority: "متوسطة", due: "2026-05-15", status: "todo" },
  { id: 3, title: "إغلاق ملف قضية 2025/2890", priority: "منخفضة", due: "2026-05-20", status: "todo" },
  { id: 4, title: "تجديد ترخيص شركة النجم", priority: "عالية", due: "2026-05-14", status: "in-progress" },
];

export const MOCK_USERS = [
  { id: 1, name: "عبدالله العتيبي", email: "admin@raed-law.sa", role: "مدير النظام", status: "نشط", lastLogin: "اليوم 09:15", initials: "عا" },
  { id: 2, name: "محمد الفهيد", email: "mohamed@raed-law.sa", role: "محامي مساعد", status: "نشط", lastLogin: "اليوم 08:30", initials: "مف" },
  { id: 3, name: "فاطمة الصالح", email: "fatima@raed-law.sa", role: "محامية", status: "نشط", lastLogin: "أمس 16:45", initials: "فص" },
  { id: 4, name: "ريم العبدلي", email: "manager@raed-law.sa", role: "مدير القضايا", status: "نشط", lastLogin: "اليوم 08:50", initials: "رع" },
  { id: 5, name: "نورة الحربي", email: "noura@raed-law.sa", role: "سكرتيرة", status: "نشط", lastLogin: "اليوم 08:00", initials: "نح" },
  { id: 6, name: "يوسف الزهراني", email: "consultant@raed-law.sa", role: "مستشار قانوني", status: "نشط", lastLogin: "اليوم 09:00", initials: "يز" },
  { id: 7, name: "طلال الفقيه", email: "auditor@raed-law.sa", role: "مدقّق قانوني", status: "نشط", lastLogin: "أمس 17:30", initials: "طف" },
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, title: "🚨 قضية متجاوزة الحد الزمني", desc: "قضية 2025/3201 تجاوزت الحد الأقصى للمرافعة", time: "قبل 5 دقائق", urgency: "red", unread: true },
  { id: 2, title: "⚠ موعد جلسة قريب", desc: "جلسة قضية 2026/0142 بعد 7 أيام", time: "قبل 30 دقيقة", urgency: "yellow", unread: true },
  { id: 3, title: "🚨 موعد نهائي عاجل", desc: "تقديم دفاع قضية 2026/0099 خلال 3 أيام", time: "قبل ساعة", urgency: "red", unread: true },
  { id: 4, title: "📋 طلب إجازة جديد", desc: "خالد المطيري يطلب إجازة سنوية لمدة 7 أيام", time: "قبل 3 ساعات", urgency: "yellow", unread: true },
  { id: 5, title: "✓ تم اعتماد المصروف", desc: "اعتمد المدير مصروف رسوم محكمة 1500 ر.س", time: "أمس 14:30", urgency: "green", unread: false },
];
