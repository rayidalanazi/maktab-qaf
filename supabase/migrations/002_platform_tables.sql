-- =============================================================================
-- قاف — Platform-level tables (tenants, subscriptions, addons, payments, admin)
-- These are NOT tenant-scoped; the platform admin owns them.
-- =============================================================================

-- Tenants — one row per law firm using قاف
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                       -- raed.qaf.sa subdomain
  name text not null,                              -- شركة رائد للمحاماة
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

-- Subscriptions — one per tenant
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

-- Tenant addons — many à-la-carte features per tenant
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

-- Payments — audit log of all Moyasar events
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

-- Platform admins — your team (you + future support staff)
create table public.platform_admins (
  user_id uuid primary key,                         -- auth.users.id
  role text not null default 'admin',               -- admin | support | analyst
  added_at timestamptz not null default now(),
  added_by uuid
);

-- Audit log — every sensitive action, append-only
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

-- Support tickets — opened by tenants, handled by platform admins
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
