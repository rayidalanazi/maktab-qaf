-- ============================================================================
-- قاف (Maktab Qaf) — ONE-PASTE DATABASE SETUP
-- ============================================================================
-- HOW TO USE:
--   1. Create a new Supabase project (supabase.com -> New project).
--   2. Open the SQL Editor in your project.
--   3. Paste this ENTIRE file and click RUN.
--   4. Send me: Project URL + anon public key + service_role key
--      (Project Settings -> API).
-- This file = migrations 001..005 combined (enums, platform tables, users+auth
-- hooks, tenant data tables, RLS policies). Safe to run once on a fresh project.
-- ============================================================================

-- ===== 001_enums.sql =====
-- =============================================================================
-- Ù‚Ø§Ù â€” Enums for all status / type fields
-- Derived from supabase/_design.json (architecture workflow output).
-- =============================================================================

create type user_role as enum (
  'admin', 'general_manager', 'executive_director', 'partner',
  'manager', 'lawyer', 'consultant', 'marketer', 'auditor',
  'accountant', 'secretary', 'platform_admin'
);

create type user_status as enum ('active', 'invited', 'suspended', 'disabled');

create type tenant_status as enum (
  'trialing', 'active', 'past_due', 'suspended', 'cancelled'
);

create type subscription_tier as enum (
  'trial', 'tier_49', 'tier_199', 'tier_499', 'tier_1999'
);

create type subscription_status as enum (
  'trialing', 'active', 'past_due', 'cancelled', 'expired'
);

create type addon_status as enum ('active', 'cancelled', 'expired');

create type payment_status as enum (
  'initiated', 'pending', 'paid', 'failed', 'refunded'
);

create type case_status as enum (
  'draft', 'open', 'in_progress', 'hearing_scheduled',
  'awaiting_judgment', 'won', 'lost', 'settled', 'withdrawn', 'archived'
);

create type case_type as enum (
  'civil', 'criminal', 'commercial', 'labor', 'family',
  'administrative', 'real_estate', 'ip', 'tax', 'arbitration', 'consulting'
);

create type case_priority as enum ('low', 'normal', 'high', 'urgent');

create type memo_status as enum (
  'draft', 'review', 'approved', 'submitted', 'rejected'
);

create type memo_type as enum (
  'statement_of_claim', 'defense', 'rejoinder', 'appeal',
  'memo_general', 'expert_report'
);

create type document_category as enum (
  'case_document', 'contract', 'evidence', 'id_document',
  'license', 'memo_attachment', 'internal', 'other'
);

create type contract_status as enum (
  'draft', 'pending_signature', 'active', 'expired', 'terminated', 'renewed'
);

create type license_status as enum (
  'active', 'expiring_soon', 'expired', 'renewed'
);

create type lead_status as enum (
  'new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost'
);

create type schedule_event_type as enum (
  'hearing', 'client_meeting', 'internal_meeting',
  'deadline', 'reminder', 'consultation'
);

create type attendance_status as enum (
  'present', 'absent', 'late', 'remote', 'leave', 'sick'
);

create type task_status as enum (
  'todo', 'in_progress', 'blocked', 'done', 'cancelled'
);

create type task_priority as enum ('low', 'normal', 'high', 'urgent');

create type invoice_status as enum (
  'draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'refunded'
);

create type notification_type as enum (
  'task_assigned', 'case_update', 'hearing_reminder', 'document_shared',
  'request_status_change', 'payment_received', 'license_expiring',
  'system_alert', 'mention'
);


-- ===== 002_platform_tables.sql =====
-- =============================================================================
-- Ù‚Ø§Ù â€” Platform-level tables (tenants, subscriptions, addons, payments, admin)
-- These are NOT tenant-scoped; the platform admin owns them.
-- =============================================================================

-- Tenants â€” one row per law firm using Ù‚Ø§Ù
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                       -- raed.qaf.sa subdomain
  name text not null,                              -- Ø´Ø±ÙƒØ© Ø±Ø§Ø¦Ø¯ Ù„Ù„Ù…Ø­Ø§Ù…Ø§Ø©
  name_en text,
  email_domain text,                               -- raed-law.sa
  custom_domain text unique,                       -- optional: law.firm.sa
  logo_url text,
  brand_colors jsonb,                              -- {primary, dark, light}
  support_email text,
  support_phone text,
  status tenant_status not null default 'trialing',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint slug_valid check (slug ~ '^[a-z][a-z0-9-]{1,28}[a-z0-9]$'),
  constraint slug_reserved check (
    slug not in ('www', 'api', 'admin', 'app', 'mail', 'qaf', 'support')
  )
);

create index idx_tenants_status on public.tenants (status);
create index idx_tenants_created_at on public.tenants (created_at desc);

-- Subscriptions â€” one per tenant
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  tier subscription_tier not null default 'trial',
  status subscription_status not null default 'trialing',
  seats_included int not null default 1,
  trial_ends_at timestamptz,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancelled_at timestamptz,
  -- Moyasar
  moyasar_customer_id text,
  moyasar_subscription_id text,
  -- Pricing
  price_monthly_sar int not null default 0,
  billing_cycle text not null default 'monthly',   -- monthly | annual
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_subscriptions_tenant on public.subscriptions (tenant_id);
create index idx_subscriptions_status on public.subscriptions (status);

-- Tenant addons â€” many Ã -la-carte features per tenant
create table public.tenant_addons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  addon_key text not null,                          -- 'memos_module', 'invoicing_pro', ...
  status addon_status not null default 'active',
  added_at timestamptz not null default now(),
  cancelled_at timestamptz,
  price_paid_monthly_sar int not null default 0,
  metadata jsonb not null default '{}'::jsonb,

  unique (tenant_id, addon_key)
);

create index idx_tenant_addons_tenant on public.tenant_addons (tenant_id);
create index idx_tenant_addons_active
  on public.tenant_addons (tenant_id, addon_key)
  where status = 'active';

-- Payments â€” audit log of all Moyasar events
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id),
  amount_sar int not null,
  status payment_status not null default 'initiated',
  payment_type text not null,                       -- 'subscription' | 'addon' | 'one_time'
  moyasar_payment_id text unique,
  moyasar_invoice_id text,
  paid_at timestamptz,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_payments_tenant on public.payments (tenant_id, created_at desc);
create index idx_payments_status on public.payments (status);

-- Platform admins â€” your team (you + future support staff)
create table public.platform_admins (
  user_id uuid primary key,                         -- auth.users.id
  role text not null default 'admin',               -- admin | support | analyst
  added_at timestamptz not null default now(),
  added_by uuid
);

-- Audit log â€” every sensitive action, append-only
create table public.audit_log (
  id bigserial primary key,
  tenant_id uuid references public.tenants(id) on delete cascade,
  actor_id uuid,                                    -- auth.users.id
  entity_type text not null,                        -- 'case', 'invoice', 'user', ...
  entity_id text,
  action text not null,                             -- 'created' | 'updated' | 'deleted'
  before jsonb,
  after jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_audit_tenant_created on public.audit_log (tenant_id, created_at desc);

-- Support tickets â€” opened by tenants, handled by platform admins
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  opened_by uuid not null,                          -- auth.users.id
  subject text not null,
  body text not null,
  priority text not null default 'normal',          -- low | normal | high | critical
  status text not null default 'open',              -- open | in_progress | replied | closed
  assigned_to uuid,                                 -- platform admin user_id
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create index idx_support_tenant on public.support_tickets (tenant_id);
create index idx_support_status on public.support_tickets (status) where status != 'closed';


-- ===== 003_users_and_auth.sql =====
-- =============================================================================
-- Ù‚Ø§Ù â€” public.users extending Supabase auth.users
-- =============================================================================
-- Each app user belongs to ONE tenant (or none, for platform admins).
-- A trigger on auth.users inserts a stub row here automatically.
-- =============================================================================

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  role user_role not null default 'lawyer',
  status user_status not null default 'invited',

  full_name text not null,
  initials text,
  email text not null,
  phone text,                                      -- +9665XXXXXXXX

  -- Profile
  avatar_url text,
  bar_number text,                                 -- Ø±Ù‚Ù… Ø§Ù„ØªØ±Ø®ÙŠØµ
  bio text,
  language text not null default 'ar',

  -- Exemptions
  exempted_from_attendance boolean not null default false,
  exemption_reason text,

  -- Metadata
  invited_by uuid references public.users(id) on delete set null,
  invited_at timestamptz,
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_users_tenant on public.users (tenant_id) where deleted_at is null;
create index idx_users_role on public.users (tenant_id, role) where deleted_at is null;
create unique index idx_users_email_tenant on public.users (tenant_id, lower(email))
  where deleted_at is null;

-- Invitations â€” separate table since the invitee doesn't have an auth.users row yet
create table public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  role user_role not null default 'lawyer',
  token_hash text not null unique,                 -- sha256 of token sent in email
  invited_by uuid not null references public.users(id),
  expires_at timestamptz not null default (now() + interval '72 hours'),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),

  unique (tenant_id, email) deferrable
);

create index idx_invitations_tenant on public.user_invitations (tenant_id);
create index idx_invitations_pending on public.user_invitations (token_hash)
  where accepted_at is null and revoked_at is null;

-- =============================================================================
-- Helper: on auth.users insert, create a stub public.users row
-- (the wizard fills in tenant_id, role, full_name afterward via API)
-- =============================================================================
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- =============================================================================
-- Helper: custom JWT claims â€” inject tenant_id + role + plan into every token
-- =============================================================================
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb as $$
declare
  u_id uuid := (event->'user_id')::uuid;
  u_row public.users%rowtype;
  sub_row public.subscriptions%rowtype;
  addons text[];
  claims jsonb;
begin
  select * into u_row from public.users where id = u_id and deleted_at is null;
  if not found then return event; end if;

  claims := coalesce(event->'claims', '{}'::jsonb);
  claims := jsonb_set(claims, '{role}', to_jsonb(u_row.role));
  claims := jsonb_set(claims, '{tenant_id}', to_jsonb(u_row.tenant_id));

  if u_row.tenant_id is not null then
    select * into sub_row from public.subscriptions where tenant_id = u_row.tenant_id;
    if found then
      claims := jsonb_set(claims, '{plan}', to_jsonb(sub_row.tier));
    end if;
    select array_agg(addon_key) into addons
      from public.tenant_addons
      where tenant_id = u_row.tenant_id and status = 'active';
    claims := jsonb_set(claims, '{enabled_addons}',
      coalesce(to_jsonb(addons), '[]'::jsonb));
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$ language plpgsql stable;


-- ===== 004_tenant_data_tables.sql =====
-- =============================================================================
-- Ù‚Ø§Ù â€” Tenant-scoped data tables (every row has tenant_id, every read goes
-- through RLS).
-- =============================================================================
-- This file creates the schema only. RLS policies are in 005_rls.sql.
-- =============================================================================

-- â”€â”€â”€ Cases â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_number text not null,                       -- '2026/0142'
  court text,
  case_type case_type not null default 'civil',
  status case_status not null default 'open',
  priority case_priority not null default 'normal',
  plaintiff text not null,
  defendant text not null,
  current_action text,
  filing_date date,
  next_hearing_date date,
  deadline date,
  risk_score int default 0,
  expected_duration_days int,
  min_duration_days int,
  max_duration_days int,
  assigned_to uuid references public.users(id) on delete set null,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_cases_tenant_status on public.cases (tenant_id, status)
  where deleted_at is null;
create index idx_cases_tenant_deadline on public.cases (tenant_id, deadline)
  where deleted_at is null and deadline is not null;
create index idx_cases_assigned on public.cases (tenant_id, assigned_to)
  where deleted_at is null;
create unique index idx_cases_number on public.cases (tenant_id, case_number)
  where deleted_at is null;

-- â”€â”€â”€ Case timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table public.case_timeline (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  event_date date not null,
  event_type text not null,
  description text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_timeline_case on public.case_timeline (case_id, event_date desc);

-- â”€â”€â”€ Documents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  storage_path text not null,                      -- {tenant_id}/cases/{case_id}/file.pdf
  name text not null,
  category document_category not null default 'other',
  file_type text,
  size_bytes bigint,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_documents_tenant on public.documents (tenant_id, created_at desc)
  where deleted_at is null;
create index idx_documents_case on public.documents (case_id) where deleted_at is null;

-- â”€â”€â”€ Memos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table public.memos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  title text not null,
  memo_type memo_type not null default 'memo_general',
  status memo_status not null default 'draft',
  body text not null,
  template_id uuid,
  author_id uuid references public.users(id) on delete set null,
  current_approver_id uuid references public.users(id) on delete set null,
  due_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_memos_tenant_status on public.memos (tenant_id, status)
  where deleted_at is null;
create index idx_memos_case on public.memos (case_id) where deleted_at is null;
create index idx_memos_due on public.memos (tenant_id, due_date)
  where deleted_at is null and due_date is not null;

-- â”€â”€â”€ Schedule â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  event_type schedule_event_type not null,
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  location text,
  attendees uuid[] not null default array[]::uuid[],
  reminder_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_schedule_tenant_date on public.schedule_events (tenant_id, event_date);

-- â”€â”€â”€ Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  title text not null,
  description text,
  assigned_to uuid references public.users(id) on delete set null,
  status task_status not null default 'todo',
  priority task_priority not null default 'normal',
  due_date date,
  completed_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_owner on public.tasks (tenant_id, assigned_to, status);

-- â”€â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  target_user_id uuid references public.users(id) on delete cascade,  -- null = whole tenant
  notif_type notification_type not null,
  title text not null,
  description text,
  link_path text,                                  -- /cases/abc
  urgency text not null default 'normal',          -- red | yellow | green
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_target on public.notifications (tenant_id, target_user_id, is_read);

-- â”€â”€â”€ Invoices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_name text not null,
  case_id uuid references public.cases(id) on delete set null,
  invoice_number text not null,
  amount_sar int not null,
  vat_amount_sar int not null default 0,
  total_sar int not null,
  status invoice_status not null default 'draft',
  issued_at date not null default current_date,
  due_at date,
  paid_at date,
  zatca_uuid text,                                 -- ZATCA Phase 2 reference
  zatca_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_invoices_number on public.invoices (tenant_id, invoice_number);
create index idx_invoices_status on public.invoices (tenant_id, status);


-- ===== 005_rls_policies.sql =====
-- =============================================================================
-- Ù‚Ø§Ù â€” Row Level Security policies for hard tenant isolation
-- =============================================================================
-- The golden rule: every tenant-scoped table must filter by
--   tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
-- and addon-gated tables must also verify the addon is active.
-- =============================================================================

-- Helper: current tenant from JWT claim
create or replace function auth.current_tenant_id() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id', '')::uuid;
$$;

-- Helper: current user role from JWT claim
create or replace function auth.current_role() returns text
language sql stable as $$
  select current_setting('request.jwt.claims', true)::jsonb ->> 'role';
$$;

-- Helper: is the current user a platform admin?
create or replace function auth.is_platform_admin() returns boolean
language sql stable as $$
  select exists (
    select 1 from public.platform_admins where user_id = auth.uid()
  );
$$;

-- Helper: is a specific addon enabled for current tenant?
create or replace function auth.has_addon(addon text) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.tenant_addons
    where tenant_id = auth.current_tenant_id()
      and addon_key = addon
      and status = 'active'
  );
$$;

-- =============================================================================
-- Enable RLS on every tenant table
-- =============================================================================
alter table public.tenants enable row level security;
alter table public.subscriptions enable row level security;
alter table public.tenant_addons enable row level security;
alter table public.payments enable row level security;
alter table public.users enable row level security;
alter table public.user_invitations enable row level security;
alter table public.audit_log enable row level security;
alter table public.support_tickets enable row level security;
alter table public.cases enable row level security;
alter table public.case_timeline enable row level security;
alter table public.documents enable row level security;
alter table public.memos enable row level security;
alter table public.schedule_events enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;
alter table public.invoices enable row level security;

-- =============================================================================
-- Tenants â€” only the tenant itself + platform admins can read
-- =============================================================================
create policy "tenants_select_own"
  on public.tenants for select to authenticated
  using (id = auth.current_tenant_id() or auth.is_platform_admin());

create policy "tenants_update_own"
  on public.tenants for update to authenticated
  using (id = auth.current_tenant_id() and auth.current_role() in ('admin', 'general_manager'))
  with check (id = auth.current_tenant_id());

-- =============================================================================
-- Subscriptions, addons, payments â€” readable by tenant, mutable by platform
-- =============================================================================
create policy "subs_select" on public.subscriptions for select to authenticated
  using (tenant_id = auth.current_tenant_id() or auth.is_platform_admin());

create policy "addons_select" on public.tenant_addons for select to authenticated
  using (tenant_id = auth.current_tenant_id() or auth.is_platform_admin());

create policy "payments_select" on public.payments for select to authenticated
  using (tenant_id = auth.current_tenant_id() or auth.is_platform_admin());

-- =============================================================================
-- Users â€” only same-tenant users can read each other; admin can mutate
-- =============================================================================
create policy "users_select_same_tenant"
  on public.users for select to authenticated
  using (
    (tenant_id = auth.current_tenant_id() and deleted_at is null)
    or auth.is_platform_admin()
  );

create policy "users_admin_insert"
  on public.users for insert to authenticated
  with check (
    tenant_id = auth.current_tenant_id()
    and auth.current_role() in ('admin', 'general_manager')
  );

create policy "users_admin_update"
  on public.users for update to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and (
      auth.current_role() in ('admin', 'general_manager')
      or id = auth.uid()                            -- a user can update themselves
    )
  );

-- =============================================================================
-- Cases â€” readable by anyone in the tenant; lawyers see only assigned
-- =============================================================================
create policy "cases_select_by_role"
  on public.cases for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and deleted_at is null
    and (
      auth.current_role() in ('admin', 'general_manager', 'executive_director', 'partner', 'manager')
      or assigned_to = auth.uid()                   -- lawyers see assigned
    )
  );

create policy "cases_insert"
  on public.cases for insert to authenticated
  with check (
    tenant_id = auth.current_tenant_id()
    and auth.current_role() in ('admin', 'general_manager', 'partner', 'manager')
  );

create policy "cases_update"
  on public.cases for update to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and (
      auth.current_role() in ('admin', 'general_manager', 'partner', 'manager')
      or assigned_to = auth.uid()
    )
  );

-- =============================================================================
-- Documents â€” addon-gated by documents_vault
-- =============================================================================
create policy "documents_select"
  on public.documents for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and deleted_at is null
    and auth.has_addon('documents_vault')
  );

-- =============================================================================
-- Memos â€” addon-gated by memos_module
-- =============================================================================
create policy "memos_select"
  on public.memos for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and deleted_at is null
    and auth.has_addon('memos_module')
  );

-- =============================================================================
-- Invoices â€” addon-gated by invoicing_pro
-- =============================================================================
create policy "invoices_select"
  on public.invoices for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and auth.has_addon('invoicing_pro')
  );

-- =============================================================================
-- Tasks, Schedule, Notifications â€” always available (covered by base plan)
-- =============================================================================
create policy "tasks_select"
  on public.tasks for select to authenticated
  using (tenant_id = auth.current_tenant_id());

create policy "schedule_select"
  on public.schedule_events for select to authenticated
  using (tenant_id = auth.current_tenant_id());

create policy "notifications_select"
  on public.notifications for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and (target_user_id is null or target_user_id = auth.uid())
  );

-- =============================================================================
-- Audit + support â€” readable by tenant, writable only by service role
-- =============================================================================
create policy "audit_select"
  on public.audit_log for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and auth.current_role() in ('admin', 'auditor', 'general_manager')
  );

create policy "support_select"
  on public.support_tickets for select to authenticated
  using (tenant_id = auth.current_tenant_id() or auth.is_platform_admin());

create policy "support_insert"
  on public.support_tickets for insert to authenticated
  with check (tenant_id = auth.current_tenant_id());

