-- =============================================================================
-- قاف (Maktab Qaf) — SAFE shared-project setup
-- =============================================================================
-- Runs ALONGSIDE the existing lawyer-payments tables WITHOUT touching them.
-- All قاف objects are prefixed `qaf_` and live in the public schema, so:
--   • zero collision with lawyer-payments tables
--   • works with PostgREST out of the box (public schema already exposed)
--   • no global auth triggers / no custom JWT hook (won't disturb existing auth)
--   • multi-tenant isolation via RLS using a subquery on qaf_users
--
-- HOW TO RUN: Supabase → SQL Editor → New query → paste ALL → RUN.
-- Safe to re-run (uses IF NOT EXISTS / drop-and-recreate for policies/functions).
-- =============================================================================

-- ---------- ENUMS (prefixed, created only if missing) ----------
do $$ begin
  create type qaf_tenant_status as enum ('trialing','active','past_due','suspended','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qaf_user_role as enum ('admin','general_manager','executive_director','partner','manager','lawyer','consultant','marketer','auditor','accountant','secretary','platform_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qaf_user_status as enum ('active','invited','suspended','disabled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qaf_case_status as enum ('draft','open','in_progress','hearing_scheduled','awaiting_judgment','won','lost','settled','withdrawn','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qaf_task_status as enum ('todo','in_progress','blocked','done','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qaf_invoice_status as enum ('draft','sent','partially_paid','paid','overdue','cancelled','refunded');
exception when duplicate_object then null; end $$;

-- ---------- PLATFORM TABLES ----------
create table if not exists public.qaf_tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_en text,
  email_domain text,
  custom_domain text unique,
  logo_url text,
  brand_colors jsonb,
  plan text not null default 'bundle_base',
  enabled_addons text[] not null default array['core_cases']::text[],
  support_email text,
  support_phone text,
  status qaf_tenant_status not null default 'trialing',
  trial_ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint qaf_slug_valid check (slug ~ '^[a-z][a-z0-9-]{1,28}[a-z0-9]$')
);
create index if not exists idx_qaf_tenants_status on public.qaf_tenants (status);

create table if not exists public.qaf_platform_admins (
  user_id uuid primary key,
  role text not null default 'admin',
  added_at timestamptz not null default now()
);

create table if not exists public.qaf_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  amount_sar int not null,
  status text not null default 'paid',
  payment_type text not null default 'subscription',
  moyasar_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_payments_tenant on public.qaf_payments (tenant_id, created_at desc);

-- Grants/promos the admin gives (free feature for a limited time)
create table if not exists public.qaf_grants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  grant_type text not null,            -- free_addon | free_upgrade | extended_trial | discount | comp_seats
  label text not null,
  addon_key text,
  starts_at date not null default current_date,
  expires_at date,                     -- null = permanent
  auto_convert boolean not null default false,
  reason text,
  status text not null default 'active',
  granted_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_grants_tenant on public.qaf_grants (tenant_id);

-- ---------- USERS (extends auth.users) ----------
create table if not exists public.qaf_users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.qaf_tenants(id) on delete set null,
  role qaf_user_role not null default 'lawyer',
  status qaf_user_status not null default 'active',
  full_name text not null,
  email text not null,
  phone text,
  initials text,
  avatar_url text,
  mfa boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_users_tenant on public.qaf_users (tenant_id);

-- ---------- TENANT DATA TABLES ----------
create table if not exists public.qaf_cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  case_number text not null,
  court text,
  case_type text not null default 'مدني',
  status qaf_case_status not null default 'open',
  status_label text default 'نشط',
  plaintiff text,
  defendant text,
  current_action text,
  filing_date date,
  deadline date,
  risk_score int default 0,
  assigned_to uuid references public.qaf_users(id) on delete set null,
  assigned_to_name text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_qaf_cases_tenant on public.qaf_cases (tenant_id, created_at desc);

create table if not exists public.qaf_clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  name text not null,
  type text default 'individual',
  contact text,
  status text default 'نشط',
  lawyer_name text,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_clients_tenant on public.qaf_clients (tenant_id);

create table if not exists public.qaf_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  case_id uuid references public.qaf_cases(id) on delete set null,
  name text not null,
  file_type text,
  size_label text,
  storage_path text,
  uploader_name text,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_documents_tenant on public.qaf_documents (tenant_id, created_at desc);

create table if not exists public.qaf_memos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  case_id uuid references public.qaf_cases(id) on delete set null,
  title text not null,
  memo_type text default 'memo',
  status text not null default 'draft',
  body text,
  author_name text,
  due_date date,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_memos_tenant on public.qaf_memos (tenant_id, status);

create table if not exists public.qaf_schedule_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  case_id uuid references public.qaf_cases(id) on delete set null,
  event_type text not null default 'جلسة',
  title text not null,
  description text,
  event_date date not null,
  event_time text,
  location text,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_schedule_tenant on public.qaf_schedule_events (tenant_id, event_date);

create table if not exists public.qaf_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  case_id uuid references public.qaf_cases(id) on delete set null,
  title text not null,
  status qaf_task_status not null default 'todo',
  priority text default 'متوسطة',
  due_date date,
  owner_id uuid references public.qaf_users(id) on delete set null,
  owner_name text,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_tasks_tenant on public.qaf_tasks (tenant_id, status);

create table if not exists public.qaf_notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  target_user_id uuid references public.qaf_users(id) on delete cascade,
  title text not null,
  description text,
  urgency text default 'green',
  link_path text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_notifications_tenant on public.qaf_notifications (tenant_id, is_read);

create table if not exists public.qaf_invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  client_name text not null,
  case_id uuid references public.qaf_cases(id) on delete set null,
  invoice_number text not null,
  amount_sar int not null,
  vat_sar int not null default 0,
  total_sar int not null,
  status qaf_invoice_status not null default 'draft',
  issued_at date not null default current_date,
  due_at date,
  paid_at date,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_invoices_tenant on public.qaf_invoices (tenant_id, status);

create table if not exists public.qaf_expenses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  item text not null,
  amount_sar int not null,
  category text,
  paid_by text,
  status text default 'معتمد',
  case_number text,
  spent_at date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_expenses_tenant on public.qaf_expenses (tenant_id);

-- =============================================================================
-- HELPER FUNCTIONS (no JWT hook needed — read tenant/role from qaf_users)
-- =============================================================================
create or replace function public.qaf_current_tenant() returns uuid
language sql stable security definer set search_path = public as $$
  select tenant_id from public.qaf_users where id = auth.uid();
$$;

create or replace function public.qaf_current_role() returns text
language sql stable security definer set search_path = public as $$
  select role::text from public.qaf_users where id = auth.uid();
$$;

create or replace function public.qaf_is_platform_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.qaf_platform_admins where user_id = auth.uid());
$$;

-- Provision a NEW firm for the calling user (used by signup). SECURITY DEFINER so
-- a brand-new user (no tenant yet) can create their firm + become its admin.
create or replace function public.qaf_provision_tenant(
  p_slug text, p_name text, p_email_domain text default null,
  p_full_name text default null, p_plan text default 'bundle_base'
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_tenant uuid; v_uid uuid := auth.uid(); v_email text;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  -- one firm per user (idempotent-ish): if already has a tenant, return it
  select tenant_id into v_tenant from public.qaf_users where id = v_uid;
  if v_tenant is not null then return v_tenant; end if;

  insert into public.qaf_tenants (slug, name, email_domain, plan, status, trial_ends_at, enabled_addons)
  values (lower(p_slug), p_name, p_email_domain, p_plan, 'trialing', now() + interval '14 days',
          array['core_cases','schedule_attendance','documents_vault'])
  returning id into v_tenant;

  select email into v_email from auth.users where id = v_uid;
  insert into public.qaf_users (id, tenant_id, role, status, full_name, email)
  values (v_uid, v_tenant, 'admin', 'active', coalesce(p_full_name, v_email), v_email)
  on conflict (id) do update set tenant_id = v_tenant, role = 'admin', status = 'active';

  return v_tenant;
end $$;

grant execute on function public.qaf_provision_tenant(text,text,text,text,text) to authenticated;
grant execute on function public.qaf_current_tenant() to authenticated, anon;
grant execute on function public.qaf_current_role() to authenticated, anon;
grant execute on function public.qaf_is_platform_admin() to authenticated, anon;

-- =============================================================================
-- ROW LEVEL SECURITY — hard tenant isolation
-- =============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'qaf_tenants','qaf_payments','qaf_grants','qaf_users','qaf_cases','qaf_clients',
    'qaf_documents','qaf_memos','qaf_schedule_events','qaf_tasks','qaf_notifications',
    'qaf_invoices','qaf_expenses'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- Tenants: a user sees their own tenant; platform admin sees all.
drop policy if exists qaf_tenants_select on public.qaf_tenants;
create policy qaf_tenants_select on public.qaf_tenants for select to authenticated
  using (id = public.qaf_current_tenant() or public.qaf_is_platform_admin());

drop policy if exists qaf_tenants_update on public.qaf_tenants;
create policy qaf_tenants_update on public.qaf_tenants for update to authenticated
  using (id = public.qaf_current_tenant() and public.qaf_current_role() in ('admin','general_manager'));

-- Users: same-tenant visibility; admin manages.
drop policy if exists qaf_users_select on public.qaf_users;
create policy qaf_users_select on public.qaf_users for select to authenticated
  using (tenant_id = public.qaf_current_tenant() or id = auth.uid() or public.qaf_is_platform_admin());

drop policy if exists qaf_users_self_update on public.qaf_users;
create policy qaf_users_self_update on public.qaf_users for update to authenticated
  using (id = auth.uid() or (tenant_id = public.qaf_current_tenant() and public.qaf_current_role() in ('admin','general_manager')));

-- Generic tenant-scoped policies (select/insert/update/delete) for data tables.
do $$
declare t text;
begin
  foreach t in array array[
    'qaf_cases','qaf_clients','qaf_documents','qaf_memos','qaf_schedule_events',
    'qaf_tasks','qaf_notifications','qaf_invoices','qaf_expenses','qaf_payments','qaf_grants'
  ] loop
    execute format('drop policy if exists %I on public.%I;', t||'_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (tenant_id = public.qaf_current_tenant() or public.qaf_is_platform_admin()) with check (tenant_id = public.qaf_current_tenant() or public.qaf_is_platform_admin());',
      t||'_all', t);
  end loop;
end $$;

-- =============================================================================
-- DONE. Next: send me Project URL + anon key (service_role optional for admin/seed).
-- =============================================================================
