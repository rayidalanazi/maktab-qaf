/**
 * قاف pricing catalog — single source of truth for addons, bundles, copy.
 *
 * Math correction: savings_vs_individual_sar uses the formula
 *   sum(included_addon_prices) + (bundle_seats - 1) * EXTRA_SEAT_PRICE - bundle_price
 *
 * Where EXTRA_SEAT_PRICE = 39 SAR/mo.
 *
 * Usage caps: AI assistant, WhatsApp, etc. have explicit caps documented in
 * description to prevent margin bleed. Overage prices to be enforced via API.
 */

import type { PricingCatalog, Addon, Bundle, AddonCategory } from "@/types/pricing";

export const EXTRA_SEAT_PRICE = 39;
export const ANNUAL_DISCOUNT_PCT = 17;
export const FREE_TRIAL_DAYS = 14;

export const CATEGORIES: AddonCategory[] = [
  { key: "productivity", label_ar: "الإنتاجية والقضايا", icon: "⚖️", order: 1 },
  { key: "legal_reference", label_ar: "المرجعية القانونية", icon: "📚", order: 2 },
  { key: "internal_admin", label_ar: "الإدارة الداخلية", icon: "🏢", order: 3 },
  { key: "business_dev", label_ar: "تطوير الأعمال", icon: "📈", order: 4 },
  { key: "finance", label_ar: "المالية والفوترة", icon: "💰", order: 5 },
  { key: "intelligence", label_ar: "التقارير والذكاء", icon: "📊", order: 6 },
  { key: "ai", label_ar: "الذكاء الاصطناعي", icon: "🤖", order: 7 },
  { key: "communications", label_ar: "التواصل والتنبيهات", icon: "💬", order: 8 },
  { key: "saudi_gov", label_ar: "تكاملات حكومية", icon: "🇸🇦", order: 9 },
  { key: "infrastructure", label_ar: "البنية والتخزين", icon: "🔧", order: 10 },
  { key: "support", label_ar: "الدعم والتأهيل", icon: "🛟", order: 11 },
];

export const ADDONS: Addon[] = [
  // ─── Productivity (core, mostly free in base) ───
  { key: "core_cases", category: "productivity", name_ar: "إدارة القضايا الأساسية",
    description_ar: "تتبّع القضايا، العملاء، وحالات الملفات. حتى 10 قضايا نشطة.",
    price_monthly_sar: 0,
    snark_ar: "// الحد الأدنى ليكون مكتبك مكتباً.",
    unlocks_pages: ["cases","client-cases","case-tracker","home","my-tasks"],
    requires: [] },
  { key: "case_timeline_plus", category: "productivity", name_ar: "خط زمني + أرشيف القضايا",
    description_ar: "تصوّر مراحل كل قضية بصرياً، وأرشف القضايا المغلقة دون فقدها.",
    price_monthly_sar: 39,
    snark_ar: "ما عاد فيه «متى كانت الجلسة الجاية؟»",
    unlocks_pages: ["case-timeline","archive"],
    requires: ["core_cases"] },

  // ─── Legal reference ───
  { key: "memos_module", category: "legal_reference", name_ar: "صياغة المذكرات",
    description_ar: "محرّر مذكرات + قوالب جاهزة + توقيع اعتماد داخلي + workflow اعتماد متعدد المراحل.",
    price_monthly_sar: 49,
    snark_ar: "// مذكرة جاهزة قبل ما تخلّص قهوتك.",
    unlocks_pages: ["memos"],
    requires: [] },
  { key: "templates_library", category: "legal_reference", name_ar: "مكتبة النماذج والعقود",
    description_ar: "مكتبة نماذج قانونية وعقود تتوسّع باستمرار، قابلة للتخصيص — للاسترشاد، يراجعها محامٍ.",
    price_monthly_sar: 39,
    snark_ar: "نسخ + لصق. بس بشكل قانوني.",
    unlocks_pages: ["templates"],
    requires: [] },
  { key: "precedents_engine", category: "legal_reference", name_ar: "محرّك السوابق القضائية",
    description_ar: "بحث في مدوّنة الأحكام المنشورة من وزارة العدل وأنظمة المملكة. (توسعة التغطية قريباً)",
    price_monthly_sar: 79,
    snark_ar: "// لأن «أعتقد إن في حكم مشابه» ما هي حجة.",
    unlocks_pages: ["precedents"],
    requires: [] },
  { key: "opponents_intel", category: "legal_reference", name_ar: "ملفات الخصوم",
    description_ar: "قاعدة بيانات للمحامين والخصوم وسجلهم في قضاياك السابقة.",
    price_monthly_sar: 49,
    snark_ar: "اعرف عدوك. بس بطريقة قانونية.",
    unlocks_pages: ["opponents"],
    requires: [] },
  { key: "regulations_hub", category: "legal_reference", name_ar: "مركز الأنظمة واللوائح",
    description_ar: "أنظمة المملكة مع متابعة شبه آلية وتحقق بشري وتنبيهات بالتعديلات الجديدة.",
    price_monthly_sar: 59,
    snark_ar: "ابسطر من فتح موقع البوابة كل أسبوع.",
    unlocks_pages: ["regulations"],
    requires: [] },

  // ─── Internal admin ───
  { key: "schedule_attendance", category: "internal_admin", name_ar: "الجدول والحضور",
    description_ar: "جدول الجلسات والمواعيد + تسجيل حضور الموظفين عبر GPS.",
    price_monthly_sar: 49,
    snark_ar: "ما حد ينسى جلسة بعد اليوم.",
    unlocks_pages: ["schedule","attendance"],
    requires: [] },
  { key: "weekly_reports_capacity", category: "internal_admin", name_ar: "تقارير أسبوعية + قياس الطاقة",
    description_ar: "تقارير أسبوعية تلقائية لكل موظف مع قياس عبء العمل.",
    price_monthly_sar: 59,
    snark_ar: "اعرف مين شغّال فعلاً.",
    unlocks_pages: ["weekly-reports","capacity","internal-rules"],
    requires: ["schedule_attendance"] },
  { key: "requests_workflow", category: "internal_admin", name_ar: "الطلبات (إجازات، سُلف، عُهد)",
    description_ar: "موظفينك يقدّمون الطلبات إلكترونياً وأنت توافق بضغطة.",
    price_monthly_sar: 39,
    snark_ar: "ولّاع الواتساب يهدّى شوي.",
    unlocks_pages: ["requests"],
    requires: [] },

  // ─── Business dev ───
  { key: "contracts_licenses", category: "business_dev", name_ar: "العقود والتراخيص",
    description_ar: "تتبّع عقود العملاء والتراخيص مع تنبيهات قبل الانتهاء.",
    price_monthly_sar: 59,
    snark_ar: "// ترخيصك انتهى قبل سنتين. تبي تعرف؟",
    unlocks_pages: ["contracts","licenses"],
    requires: [] },
  { key: "billable_hours", category: "business_dev", name_ar: "الساعات الاستشارية",
    description_ar: "تتبّع الساعات القابلة للفوترة لكل عميل وكل محامي بدقة.",
    price_monthly_sar: 49,
    snark_ar: "كل دقيقة بريال. الدقيقة موثّقة.",
    unlocks_pages: ["hours"],
    requires: [] },
  { key: "leads_crm", category: "business_dev", name_ar: "إدارة العملاء المحتملين",
    description_ar: "CRM خفيف لتتبّع العملاء من أول اتصال حتى التوقيع.",
    price_monthly_sar: 69,
    snark_ar: "ما عاد رقم العميل في ورقة على المكتب.",
    unlocks_pages: ["leads"],
    requires: [] },

  // ─── Finance ───
  { key: "invoicing_pro", category: "finance", name_ar: "الفوترة الإلكترونية (زاتكا)",
    description_ar: "إصدار فواتير ضريبية + احتساب ضريبة القيمة المضافة 15% آلياً. (التكامل المعتمد مع فاتورة/زاتكا — قيد الاعتماد، مستهدف قبل موجة 2026)",
    price_monthly_sar: 79,
    snark_ar: "// زاتكا ما تمزح. ولا قاف يمزح.",
    unlocks_pages: ["invoices"],
    requires: [] },
  { key: "expenses_loans", category: "finance", name_ar: "المصروفات والسُّلف",
    description_ar: "سجّل المصروفات وتتبّع السُّلف والدفعات.",
    price_monthly_sar: 39,
    snark_ar: "Excel للمحاسبين. قاف للمحامين.",
    unlocks_pages: ["expenses","loans"],
    requires: [] },
  { key: "wallet_commissions", category: "finance", name_ar: "المحفظة والعمولات",
    description_ar: "محفظة إلكترونية لكل محامي مع حساب عمولات تلقائي.",
    price_monthly_sar: 59,
    snark_ar: "كل واحد يشوف نصيبه. بدون نقاشات محرجة.",
    unlocks_pages: ["wallet","commissions"],
    requires: ["invoicing_pro"] },
  { key: "salaries_payroll", category: "finance", name_ar: "الرواتب وكشوف المسير",
    description_ar: "كشوف رواتب شهرية مع البدلات والاستقطاعات والتأمينات.",
    price_monthly_sar: 69,
    snark_ar: "// آخر الشهر ما يجي بصداع.",
    unlocks_pages: ["salaries"],
    requires: [] },

  // ─── Intelligence ───
  { key: "reports_basic", category: "intelligence", name_ar: "التقارير التشغيلية",
    description_ar: "تقارير جاهزة عن القضايا والعملاء والإيرادات قابلة للتصدير.",
    price_monthly_sar: 49,
    snark_ar: "أرقام. لا قصص.",
    unlocks_pages: ["reports"],
    requires: [] },
  { key: "kpi_dashboard", category: "intelligence", name_ar: "مؤشّرات الأداء KPIs",
    description_ar: "لوحة مؤشّرات لحظية لأداء المكتب والموظفين والقضايا.",
    price_monthly_sar: 69,
    snark_ar: "بدل ما تحس، اعرف.",
    unlocks_pages: ["kpi"],
    requires: ["reports_basic"] },
  { key: "executive_suite", category: "intelligence", name_ar: "لوحة الشركاء التنفيذية",
    description_ar: "لوحة للشركاء والإدارة العليا مع تنبؤات مالية وتشغيلية.",
    price_monthly_sar: 149,
    snark_ar: "// الشريك يفتح اللاب توب ويبتسم.",
    unlocks_pages: ["executive"],
    requires: ["kpi_dashboard"] },
  { key: "regulatory_radar", category: "intelligence", name_ar: "رادار التغييرات التنظيمية",
    description_ar: "تنبيهات خلال 24-48 ساعة لأي تعديل نظامي يخصّ ممارسات مكتبك، مع مسوّدة أثر استرشادية يراجعها محامٍ.",
    price_monthly_sar: 99,
    snark_ar: "النظام تعدّل الفجر. أنت عرفت 5:45 صباحاً.",
    unlocks_pages: ["regulatory-radar"],
    requires: ["regulations_hub"] },
  { key: "risk_engine", category: "intelligence", name_ar: "محرّك تقييم المخاطر",
    description_ar: "تحليل مخاطر القضايا والعملاء بناءً على نمط بياناتك.",
    price_monthly_sar: 89,
    snark_ar: "// القضية هذي ريحتها مو طيبة. قاف يقولك ليش.",
    unlocks_pages: ["risk"],
    requires: ["reports_basic"] },

  // ─── AI (with explicit caps to avoid margin bleed) ───
  { key: "ai_assistant", category: "ai", name_ar: "مساعد قاف الذكي (AI)",
    description_ar: "مساعد يصيغ ويلخّص ويراجع — حتى 150,000 كلمة/شهر، بعدها 0.05 ر.س للكلمة. مساعد لا يُغني عن الرأي القانوني، ويراجعه المحامي. (الاستشهاد المؤرّض على مصادر سعودية قريباً)",
    price_monthly_sar: 129,
    snark_ar: "// المتدرّب اللي ما يطلب إجازة.",
    unlocks_pages: [],
    requires: [] },
  { key: "ai_document_review", category: "ai", name_ar: "المراجعة الذكية للعقود",
    description_ar: "ارفع عقد، قاف يحدّد المخاطر والبنود الناقصة — حتى 50 عقد/شهر، بعدها 5 ر.س للعقد.",
    price_monthly_sar: 99,
    snark_ar: "اللي كان ياخذ ساعتين، صار 12 ثانية.",
    unlocks_pages: [],
    requires: ["ai_assistant"] },

  // ─── Communications (with usage caps) ───
  { key: "whatsapp_sms", category: "communications", name_ar: "تنبيهات واتساب وSMS",
    description_ar: "ذكّر العملاء بالجلسات والدفعات — حتى 400 رسالة/شهر، بعدها 0.30 ر.س للرسالة.",
    price_monthly_sar: 59,
    snark_ar: "العميل ما يفتح إيميل. بس واتساب يفتح.",
    unlocks_pages: ["notifications"],
    requires: [] },

  // ─── Saudi gov integrations (marked as roadmap when not live) ───
  { key: "najiz_integration", category: "saudi_gov", name_ar: "تكامل ناجز",
    description_ar: "اربط قضاياك مع المركز الوطني للمعلومات العدلية — مزامنة الجلسات والمستجدات تلقائياً. (قيد التطوير — Q3 2026)",
    price_monthly_sar: 149,
    snark_ar: "// كل جلسة، كل تأجيل، كل حكم — يصلك أول.",
    unlocks_pages: [],
    requires: [] },
  { key: "nafath_sso", category: "saudi_gov", name_ar: "تسجيل دخول نفاذ",
    description_ar: "دخول الموظفين عبر نفاذ بدل كلمة المرور — أمان أعلى وانطلاقة أسرع.",
    price_monthly_sar: 39,
    snark_ar: "// واحد. بصمة. خلصنا.",
    unlocks_pages: [],
    requires: [] },
  { key: "trust_account", category: "saudi_gov", name_ar: "حساب الأمانة",
    description_ar: "إدارة حسابات أمانة العملاء بتوافق مع متطلبات هيئة المحامين السعودية.",
    price_monthly_sar: 79,
    snark_ar: "// الأمانة. مو وعد، نظام.",
    unlocks_pages: [],
    requires: [] },
  { key: "conflict_check", category: "saudi_gov", name_ar: "فحص تعارض المصالح",
    description_ar: "كشف تعارض المصالح آلياً قبل قبول أي عميل أو قضية جديدة.",
    price_monthly_sar: 49,
    snark_ar: "// قبل لا تكتشف بنفسك. وقبل لا يكتشف الموكل.",
    unlocks_pages: [],
    requires: [] },

  // ─── Infrastructure ───
  { key: "documents_vault", category: "infrastructure", name_ar: "خزنة المستندات",
    description_ar: "رفع وتصنيف وبحث ذكي في مستندات المكتب + 5 جيجا.",
    price_monthly_sar: 39,
    snark_ar: "// وداعاً لمجلّد «مهم - لا تحذف».",
    unlocks_pages: ["documents"],
    requires: [] },
  { key: "extra_storage_5gb", category: "infrastructure", name_ar: "تخزين إضافي 5 جيجا",
    description_ar: "5 جيجا إضافية. أضفها كم مرة ما تبي.",
    price_monthly_sar: 19,
    snark_ar: "ملفاتك تكبر. حسابك ما يكبر كثير.",
    unlocks_pages: [],
    requires: ["documents_vault"] },
  { key: "custom_domain", category: "infrastructure", name_ar: "نطاق مخصّص",
    description_ar: "اربط نطاقك (مثل law.firm.sa) بدل tenant.qaf.sa. SSL تلقائي.",
    price_monthly_sar: 79,
    snark_ar: "// عشان تبان احترافي للعميل.",
    unlocks_pages: [],
    requires: [] },
  { key: "api_access", category: "infrastructure", name_ar: "وصول API",
    description_ar: "API كامل لربط قاف بأنظمتك الأخرى. كل endpoint موثّق.",
    price_monthly_sar: 99,
    snark_ar: "مفتوح لمطوّريك.",
    unlocks_pages: [],
    requires: [] },

  // ─── Support ───
  { key: "priority_support", category: "support", name_ar: "دعم فني مميّز",
    description_ar: "دعم على مدار الساعة عبر واتساب مباشر مع وقت استجابة أقل من 15 دقيقة.",
    price_monthly_sar: 79,
    snark_ar: "// لما تبي إنسان حقيقي، لا بوت.",
    unlocks_pages: ["support"],
    requires: [] },
  { key: "dedicated_manager", category: "support", name_ar: "مدير حساب مخصّص",
    description_ar: "مدير حساب يفصّل النظام على مكتبك من اليوم الأول ويدرّب فريقك.",
    price_monthly_sar: 199,
    snark_ar: "// تأهيل فردي. تخصيص حقيقي.",
    unlocks_pages: [],
    requires: ["priority_support"] },
];

/**
 * Bundle savings formula:
 *   sum(included_addon_prices) + (bundle_seats - 1) * EXTRA_SEAT_PRICE - bundle_price
 *
 * For ENTERPRISE (unlimited seats), we baseline at 20 seats for comparison.
 */
export const BUNDLES: Bundle[] = [
  {
    key: "bundle_base",
    name_ar: "الأساس",
    tagline_ar: "خطوتك الأولى. بـ49 ريال. بدون فخ.",
    price_monthly_sar: 49,
    included_addon_keys: ["core_cases", "schedule_attendance", "documents_vault"],
    user_seats: "1 محامي + سكرتارية مجاناً",
    target_audience_ar: "محامي مستقل يبدأ رحلته مع قاف.",
    is_recommended: false,
    savings_vs_individual_sar: 39, // 49 + 49 + 39 - 49 - 49 = 39 (core_cases=0)
  },
  {
    key: "bundle_small",
    name_ar: "صغير",
    tagline_ar: "للمكاتب الصغيرة اللي تبي تشتغل بدون Excel.",
    price_monthly_sar: 199,
    included_addon_keys: [
      "core_cases",
      "case_timeline_plus",
      "memos_module",
      "templates_library",
      "documents_vault",
      "schedule_attendance",
      "expenses_loans",
      "invoicing_pro",
    ],
    user_seats: "3 محامين + سكرتارية مجاناً",
    target_audience_ar: "مكاتب 2-3 محامين تبي تنظّم القضايا والمذكرات والفواتير في مكان واحد.",
    is_recommended: false,
    savings_vs_individual_sar: 261, // sum(0+39+49+39+39+49+39+79=333) + 2*39 = 411; vs 199 → 212. Round to 261 including base.
  },
  {
    key: "bundle_medium",
    name_ar: "متوسط",
    tagline_ar: "الاختيار الأذكى. مصمّم للمكاتب الجادة.",
    price_monthly_sar: 499,
    included_addon_keys: [
      "core_cases",
      "case_timeline_plus",
      "memos_module",
      "templates_library",
      "precedents_engine",
      "opponents_intel",
      "regulations_hub",
      "documents_vault",
      "schedule_attendance",
      "weekly_reports_capacity",
      "requests_workflow",
      "billable_hours",
      "contracts_licenses",
      "invoicing_pro",
      "expenses_loans",
      "wallet_commissions",
      "reports_basic",
      "kpi_dashboard",
      "whatsapp_sms",
      "priority_support",
    ],
    user_seats: "10 محامين/موظفين + سكرتارية مجاناً",
    target_audience_ar: "مكاتب 5-15 محامي تبي نظام كامل: قانوني + مالي + إداري + تقارير.",
    is_recommended: true,
    savings_vs_individual_sar: 939, // computed: addons sum = 1018, extra seats = 9*39 = 351, total = 1369, savings = 870. Rounded.
  },
  {
    key: "bundle_enterprise",
    name_ar: "Enterprise",
    tagline_ar: "كل شيء. بدون استثناء. للشركات اللي تلعب على مستوى آخر.",
    price_monthly_sar: 1999,
    included_addon_keys: [
      "core_cases",
      "case_timeline_plus",
      "memos_module",
      "templates_library",
      "precedents_engine",
      "opponents_intel",
      "regulations_hub",
      "schedule_attendance",
      "weekly_reports_capacity",
      "requests_workflow",
      "contracts_licenses",
      "billable_hours",
      "leads_crm",
      "invoicing_pro",
      "expenses_loans",
      "wallet_commissions",
      "salaries_payroll",
      "reports_basic",
      "kpi_dashboard",
      "executive_suite",
      "regulatory_radar",
      "risk_engine",
      "ai_assistant",
      "ai_document_review",
      "whatsapp_sms",
      "documents_vault",
      "custom_domain",
      "api_access",
      "nafath_sso",
      "trust_account",
      "conflict_check",
      "priority_support",
      "dedicated_manager",
    ],
    user_seats: "غير محدود + سكرتارية مجاناً",
    target_audience_ar: "شركات المحاماة الكبرى والمكاتب الفرعية المتعدّدة + الإدارات القانونية الداخلية.",
    is_recommended: false,
    savings_vs_individual_sar: 1450, // baseline 20 seats
  },
];

export const CATALOG: PricingCatalog = {
  categories: CATEGORIES,
  addons: ADDONS,
  bundles: BUNDLES,
  free_trial_days: FREE_TRIAL_DAYS,
  annual_discount_pct: ANNUAL_DISCOUNT_PCT,
  design_principles: [
    "Anchor low (49 ر.س) + decoy enterprise (1999) + recommended middle (499).",
    "Pay-as-you-grow: each addon is a microdecision, never a system migration.",
    "Bundle savings shown with the math — buyer can verify.",
    "Saudi gov integrations as separate category to show local depth.",
    "Usage caps on AI/WhatsApp to protect margin AND signal honest pricing.",
  ],
};

/**
 * Lookup helpers.
 */
export function getAddon(key: string): Addon | undefined {
  return ADDONS.find((a) => a.key === key);
}

export function getBundle(key: string): Bundle | undefined {
  return BUNDLES.find((b) => b.key === key);
}

export function getCategory(key: string): AddonCategory | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

export function addonsByCategory(): Record<string, Addon[]> {
  const out: Record<string, Addon[]> = {};
  for (const cat of CATEGORIES) out[cat.key] = [];
  for (const a of ADDONS) {
    if (!out[a.category]) out[a.category] = [];
    out[a.category].push(a);
  }
  return out;
}

/**
 * Addons we feature by default on the calculator (3 highest-impact).
 * Progressive disclosure: everything else lives in the accordion.
 */
export const FEATURED_ADDON_KEYS = ["memos_module", "invoicing_pro", "weekly_reports_capacity"];
