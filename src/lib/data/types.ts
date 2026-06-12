/**
 * Shared data shapes for قاف.
 *
 * The UI shapes (Case, EventItem, …) deliberately mirror the legacy MOCK_* arrays
 * so a page can swap `MOCK_CASES` → `useCases().data` with zero JSX changes.
 * The query layer (`queries.ts`) maps raw `qaf_*` DB rows into these shapes.
 */

// ---- Session / tenant ----
export interface QafProfile {
  id: string;
  tenant_id: string | null;
  role: string;
  status: string;
  full_name: string;
  email: string;
  initials?: string | null;
  avatar_url?: string | null;
}

export interface QafTenant {
  id: string;
  slug: string;
  name: string;
  name_en?: string | null;
  plan: string;
  enabled_addons: string[];
  status: string;
  trial_ends_at?: string | null;
}

// ---- UI shapes (match MOCK_* exactly) ----
export interface Case {
  id: string | number;
  name: string;
  court: string;
  type: string;
  plaintiff: string;
  defendant: string;
  status: string;
  action: string;
  deadline: string;
  risk: number;
  assignedTo: string;
}

export interface DocItem {
  id: string | number;
  name: string;
  type: string;
  size: string;
  case: string;
  uploader: string;
  date: string;
  /** storage object path (real docs) — used to make a signed download URL */
  path?: string;
}

export interface InviteRow {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

export interface EventItem {
  id: string | number;
  title: string;
  date: string;
  time: string;
  type: string;
  desc: string;
}

export interface TaskItem {
  id: string | number;
  title: string;
  priority: string;
  due: string;
  status: string;
}

export interface UserItem {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  initials: string;
}

export interface NotificationItem {
  id: string | number;
  title: string;
  desc: string;
  time: string;
  urgency: string;
  unread: boolean;
}

export interface InvoiceItem {
  id: string | number;
  client: string;
  number: string;
  amount: number;
  vat: number;
  total: number;
  status: string;
  issued: string;
  due: string;
}

export interface ExpenseItem {
  id: string | number;
  item: string;
  amount: number;
  category: string;
  paidBy: string;
  status: string;
  caseNumber: string;
  date: string;
}

export interface ClientItem {
  id: string | number;
  name: string;
  type: string;
  contact: string;
  status: string;
  lawyer: string;
}

export interface MemoItem {
  id: string | number;
  title: string;
  type: string;
  status: string;
  author: string;
  due: string;
}

export interface AttendanceItem {
  id: string | number;
  name: string;
  role: string;
  status: string; // present | absent | late | leave
  checkIn: string;
  commitment: number;
}

export type LatLng = [number, number]; // [lat, lng] — matches getGpsFix + the RPC

export interface OfficeRow {
  id: string;
  label: string;
  kind: "circle" | "polygon";
  lat: number | null;     // circle offices
  lng: number | null;
  radius: number | null;
  polygon: LatLng[] | null; // polygon offices: ring of [lat,lng] (>=3, open)
}

export interface CheckinRow {
  id: string;
  name: string;
  kind: string;          // in | out
  status: string;        // accepted | rejected
  reason: string | null;
  distance: number | null;
  accuracy: number | null;
  office: string | null;
  time: string;          // ISO server time
  ip: string | null;
}

export interface CheckinResult {
  status: string;
  reason: string | null;
  distance: number | null;
  office: string | null;
  kind: string;
  at: string;
}

export interface RequestItem {
  id: string | number;
  code: string;
  employee: string;
  role: string;
  type: string;
  period: string;
  reason: string;
  amount?: string;
  submitted: string;
  status: string; // بانتظار الموافقة | معتمدة | مرفوضة
}

export interface SalaryItem {
  id: string | number;
  name: string;
  role: string;
  base: number;
  allowances: number;
  deductions: number;
  status: string; // مدفوع | معلّق
  month: string;
}

export interface TicketItem {
  id: string | number;
  subject: string;
  body: string;
  priority: string;
  status: string;
  requester: string;
  created: string;
}

// ---- Admin (platform operator) shapes ----
export interface AdminTenantRow {
  id: string;
  slug: string;
  name: string;
  plan: string;
  status: string; // trialing | active | past_due | suspended | cancelled
  enabledAddons: string[];
  trialEndsAt: string | null;
  createdAt: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  tenantId: string | null;
  lastSeen: string;
  createdAt: string;
}

export interface AdminGrantRow {
  id: string;
  tenantId: string;
  grantType: string;
  label: string;
  addonKey: string | null;
  startsAt: string;
  expiresAt: string | null;
  autoConvert: boolean;
  reason: string;
  status: string;
}

export interface AdminPaymentRow {
  id: string;
  tenantId: string;
  amount: number;
  status: string;
  paymentType: string;
  paidAt: string | null;
  createdAt: string;
}

export interface AdminBundleRow {
  bundleKey: string;
  nameAr: string;
  priceSar: number;
  addonKeys: string[];
  sort: number;
}
