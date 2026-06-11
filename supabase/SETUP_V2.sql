-- =============================================================================
-- قاف — SETUP V2: HR tables + platform-admin powers + admin enrollment + seed
-- =============================================================================
-- Run AFTER SETUP_SHARED.sql + PATCH_SECURITY.sql. Idempotent, only qaf_* objects.
-- RUN: Supabase → SQL Editor → paste ALL → Run.
--
--   1) New tenant tables: attendance, internal requests, payroll, support tickets
--   2) Platform admin can now UPDATE tenants/users (grant addons, change plans,
--      suspend users) — previously read-only
--   3) Enroll saudiicoder@gmail.com as PLATFORM ADMIN (operator of قاف)
--   4) Seed the raed firm with HR demo data (skipped if already seeded)
-- =============================================================================

-- ---------- 1) NEW TABLES ----------
create table if not exists public.qaf_attendance (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  employee_name text not null,
  role_title text,
  status text not null default 'present',      -- present | absent | late | leave
  check_in text,                               -- "07:52" or null
  commitment_pct int not null default 100,
  att_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_attendance_tenant on public.qaf_attendance (tenant_id, att_date desc);

create table if not exists public.qaf_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  req_code text not null,
  employee_name text not null,
  role_title text,
  req_type text not null,                      -- إجازة سنوية | إجازة مرضية | سلفة | عُهدة
  period_label text,
  reason text,
  amount_label text,                           -- "6,500 ر.س" or null
  status text not null default 'بانتظار الموافقة',  -- بانتظار الموافقة | معتمدة | مرفوضة
  submitted_at date not null default current_date,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_requests_tenant on public.qaf_requests (tenant_id, status);

create table if not exists public.qaf_salaries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  employee_name text not null,
  role_title text,
  base_sar int not null default 0,
  allowances_sar int not null default 0,
  deductions_sar int not null default 0,
  status text not null default 'معلّق',        -- مدفوع | معلّق
  pay_month text not null default to_char(current_date, 'YYYY-MM'),
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_salaries_tenant on public.qaf_salaries (tenant_id, pay_month);

create table if not exists public.qaf_support_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  subject text not null,
  body text,
  priority text not null default 'عادية',      -- عادية | مرتفعة | حرجة
  status text not null default 'open',         -- open | answered | closed
  requester_name text,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_support_tenant on public.qaf_support_tickets (tenant_id, status);

-- ---------- RLS for the new tables (same tenant-scoped model) ----------
do $$
declare t text;
begin
  foreach t in array array['qaf_attendance','qaf_requests','qaf_salaries','qaf_support_tickets'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t||'_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (tenant_id = public.qaf_current_tenant() or public.qaf_is_platform_admin()) with check (tenant_id = public.qaf_current_tenant() or public.qaf_is_platform_admin());',
      t||'_all', t);
  end loop;
end $$;

-- ---------- 2) PLATFORM-ADMIN WRITE POWERS ----------
-- Tenants: platform admin can update any firm (plans, addons, status, grants).
drop policy if exists qaf_tenants_update on public.qaf_tenants;
create policy qaf_tenants_update on public.qaf_tenants for update to authenticated
  using (
    public.qaf_is_platform_admin()
    or (id = public.qaf_current_tenant() and public.qaf_current_role() in ('admin','general_manager'))
  )
  with check (
    public.qaf_is_platform_admin()
    or (id = public.qaf_current_tenant() and public.qaf_current_role() in ('admin','general_manager'))
  );

-- Users: platform admin can update any user (suspend/restore, fix roles).
drop policy if exists qaf_users_platform_update on public.qaf_users;
create policy qaf_users_platform_update on public.qaf_users for update to authenticated
  using (public.qaf_is_platform_admin())
  with check (public.qaf_is_platform_admin());

-- ---------- 3) ENROLL THE OPERATOR AS PLATFORM ADMIN ----------
-- (SQL Editor runs as postgres → bypasses RLS; this is the intended path.)
insert into public.qaf_platform_admins (user_id, role)
select id, 'owner' from auth.users where lower(email) = 'saudiicoder@gmail.com'
on conflict (user_id) do nothing;

-- ---------- 4) SEED HR DATA FOR THE RAED FIRM (idempotent) ----------
do $$
declare
  v_tenant uuid;
  v_n int;
begin
  select id into v_tenant from public.qaf_tenants where slug = 'raed';
  if v_tenant is null then
    raise notice 'Firm raed not found — run SEED_DEMO.sql first. Skipping HR seed.';
    return;
  end if;

  select count(*) into v_n from public.qaf_attendance where tenant_id = v_tenant;
  if v_n = 0 then
    insert into public.qaf_attendance (tenant_id, employee_name, role_title, status, check_in, commitment_pct, att_date) values
      (v_tenant,'عبدالله العتيبي','مدير النظام','present','07:52',97,current_date),
      (v_tenant,'محمد الفهيد','محامي مساعد','present','08:05',94,current_date),
      (v_tenant,'فاطمة الصالح','محامية','late','09:18',82,current_date),
      (v_tenant,'ريم العبدلي','مدير القضايا','leave',null,91,current_date),
      (v_tenant,'نورة الحربي','سكرتيرة','present','07:46',99,current_date),
      (v_tenant,'يوسف الزهراني','مستشار قانوني','present','08:11',93,current_date),
      (v_tenant,'طلال الفقيه','مدقّق قانوني','absent',null,76,current_date);
  end if;

  select count(*) into v_n from public.qaf_requests where tenant_id = v_tenant;
  if v_n = 0 then
    insert into public.qaf_requests (tenant_id, req_code, employee_name, role_title, req_type, period_label, reason, amount_label, status, submitted_at) values
      (v_tenant,'REQ-1042','نورة الحربي','سكرتيرة','إجازة سنوية','2026-06-20 → 2026-06-27','إجازة عائلية مخططة مسبقًا.',null,'بانتظار الموافقة','2026-06-08'),
      (v_tenant,'REQ-1041','محمد الفهيد','محامي مساعد','سلفة','دفعة واحدة','سلفة على راتب شهر يونيو لظروف طارئة.','6,500 ر.س','بانتظار الموافقة','2026-06-07'),
      (v_tenant,'REQ-1040','فاطمة الصالح','محامية','عُهدة','عُهدة دائمة','جهاز لابتوب + اشتراك قواعد الأنظمة العدلية.','9,200 ر.س','بانتظار الموافقة','2026-06-06'),
      (v_tenant,'REQ-1039','يوسف الزهراني','مستشار قانوني','إجازة مرضية','2026-06-03 → 2026-06-05','إجازة مرضية مرفق بها تقرير طبي معتمد.',null,'معتمدة','2026-06-03'),
      (v_tenant,'REQ-1038','ريم العبدلي','مدير القضايا','إجازة سنوية','2026-05-25 → 2026-05-30','إجازة سنوية ضمن الرصيد المتبقي.',null,'معتمدة','2026-05-18'),
      (v_tenant,'REQ-1037','طلال الفقيه','مدقّق قانوني','سلفة','دفعة واحدة','طلب يتجاوز الحد الشهري المسموح.','15,000 ر.س','مرفوضة','2026-05-14');
  end if;

  select count(*) into v_n from public.qaf_salaries where tenant_id = v_tenant;
  if v_n = 0 then
    insert into public.qaf_salaries (tenant_id, employee_name, role_title, base_sar, allowances_sar, deductions_sar, status, pay_month) values
      (v_tenant,'عبدالله العتيبي','مدير النظام',22000,4500,1200,'مدفوع',to_char(current_date,'YYYY-MM')),
      (v_tenant,'محمد الفهيد','محامي مساعد',16000,3000,850,'مدفوع',to_char(current_date,'YYYY-MM')),
      (v_tenant,'يوسف الزهراني','مستشار قانوني',18500,3500,980,'معلّق',to_char(current_date,'YYYY-MM')),
      (v_tenant,'فاطمة الصالح','محامية',15000,2400,720,'مدفوع',to_char(current_date,'YYYY-MM')),
      (v_tenant,'ريم العبدلي','مدير القضايا',20000,5000,1100,'مدفوع',to_char(current_date,'YYYY-MM')),
      (v_tenant,'نورة الحربي','سكرتيرة',8500,1200,380,'معلّق',to_char(current_date,'YYYY-MM')),
      (v_tenant,'طلال الفقيه','مدقّق قانوني',12500,1900,610,'مدفوع',to_char(current_date,'YYYY-MM'));
  end if;

  select count(*) into v_n from public.qaf_support_tickets where tenant_id = v_tenant;
  if v_n = 0 then
    insert into public.qaf_support_tickets (tenant_id, subject, body, priority, status, requester_name) values
      (v_tenant,'استفسار عن ربط ناجز','هل التكامل مع ناجز متاح في باقتنا الحالية؟','عادية','answered','عبدالله العتيبي'),
      (v_tenant,'مشكلة في تصدير التقارير','زر التصدير لا يستجيب في تقرير القضايا الشهري.','مرتفعة','open','ريم العبدلي');
  end if;

  raise notice 'V2 seed complete for firm raed (%).', v_tenant;
end $$;

-- =============================================================================
-- DONE. saudiicoder@gmail.com is now PLATFORM ADMIN → /admin shows LIVE data.
-- =============================================================================
