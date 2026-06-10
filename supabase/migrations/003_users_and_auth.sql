-- =============================================================================
-- قاف — public.users extending Supabase auth.users
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
  bar_number text,                                 -- رقم الترخيص
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

-- Invitations — separate table since the invitee doesn't have an auth.users row yet
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
-- Helper: custom JWT claims — inject tenant_id + role + plan into every token
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
