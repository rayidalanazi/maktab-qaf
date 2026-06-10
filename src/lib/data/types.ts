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
