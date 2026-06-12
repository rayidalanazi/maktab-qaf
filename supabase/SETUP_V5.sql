-- =============================================================================
-- قاف — SETUP V5: anti-fraud GPS attendance
-- =============================================================================
-- Trust boundary = the database. The browser only sends raw lat/lng/accuracy;
-- the SECURITY DEFINER RPC decides accept/reject (geofence, accuracy, teleport),
-- stamps SERVER time, and is the ONLY writer (direct inserts are revoked).
-- Idempotent. Only qaf_ objects.
-- =============================================================================

-- 1) Office geofences (a firm can have several branches) -----------------------
create table if not exists public.qaf_office_locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  label text not null default 'المكتب الرئيسي',
  lat double precision not null,
  lng double precision not null,
  radius_m int not null default 150,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_offices_tenant on public.qaf_office_locations (tenant_id);
alter table public.qaf_office_locations enable row level security;
-- strip Supabase's default GRANT ALL (TRUNCATE/TRIGGER/REFERENCES bypass RLS); keep only RLS-gated CRUD
revoke all on public.qaf_office_locations from anon, authenticated;
grant select, insert, update, delete on public.qaf_office_locations to authenticated;
drop policy if exists qaf_offices_read on public.qaf_office_locations;
create policy qaf_offices_read on public.qaf_office_locations for select to authenticated
  using (tenant_id = public.qaf_current_tenant() or public.qaf_is_platform_admin());
drop policy if exists qaf_offices_write on public.qaf_office_locations;
create policy qaf_offices_write on public.qaf_office_locations for all to authenticated
  using (tenant_id = public.qaf_current_tenant() and public.qaf_current_role() in ('admin','general_manager'))
  with check (tenant_id = public.qaf_current_tenant() and public.qaf_current_role() in ('admin','general_manager'));

-- 2) Immutable check-in log ----------------------------------------------------
create table if not exists public.qaf_checkins (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  user_id uuid not null,
  employee_name text,
  kind text not null default 'in',          -- in | out
  lat double precision, lng double precision, accuracy_m real,
  office_id uuid, office_label text, distance_m int,
  ip text, user_agent text,
  status text not null,                      -- accepted | rejected
  reject_reason text,
  server_time timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_checkins_tenant on public.qaf_checkins (tenant_id, server_time desc);
create index if not exists idx_qaf_checkins_user on public.qaf_checkins (user_id, server_time desc);
alter table public.qaf_checkins enable row level security;
-- Read-only for the firm; NO direct write/truncate — only the validating RPC (definer) writes.
-- revoke ALL (not just write) so TRUNCATE/TRIGGER/REFERENCES can't wipe or tamper the audit log.
revoke all on public.qaf_checkins from anon, authenticated;
grant select on public.qaf_checkins to authenticated;
drop policy if exists qaf_checkins_read on public.qaf_checkins;
create policy qaf_checkins_read on public.qaf_checkins for select to authenticated
  using (tenant_id = public.qaf_current_tenant() or public.qaf_is_platform_admin());

-- 3) The ONLY way to record attendance: validated server-side ------------------
create or replace function public.qaf_check_in(
  p_lat double precision, p_lng double precision, p_accuracy real,
  p_kind text default 'in', p_user_agent text default null
) returns jsonb
language plpgsql security definer set search_path = public as $fn$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid; v_name text;
  v_o record; v_dist double precision;
  v_best double precision := 1e12; v_best_id uuid; v_best_label text; v_best_radius int;
  v_ip text; v_status text := 'accepted'; v_reason text := null;
  v_last record; v_secs double precision; v_move double precision;
  MAX_ACC constant real := 100;     -- worse than 100m accuracy is rejected
begin
  if v_uid is null then return jsonb_build_object('status','rejected','reason','غير مسجّل دخول'); end if;
  select tenant_id, full_name into v_tenant, v_name from public.qaf_users where id = v_uid;
  if v_tenant is null then return jsonb_build_object('status','rejected','reason','لا مكتب مرتبط بحسابك'); end if;
  if p_kind not in ('in','out') then p_kind := 'in'; end if;

  begin
    v_ip := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1);
  exception when others then v_ip := null; end;

  -- (a) accuracy gate
  if p_lat is null or p_lng is null then
    v_status := 'rejected'; v_reason := 'تعذّر تحديد الموقع';
  elsif p_accuracy is null or p_accuracy > MAX_ACC then
    v_status := 'rejected'; v_reason := 'دقّة GPS ضعيفة (' || round(coalesce(p_accuracy, 999)) || 'م) — فعّل الموقع الدقيق وحاول بالخارج';
  else
    -- (b) nearest office geofence (haversine, metres)
    for v_o in select * from public.qaf_office_locations where tenant_id = v_tenant loop
      v_dist := 2 * 6371000 * asin( sqrt(
        power(sin(radians(p_lat - v_o.lat) / 2), 2) +
        cos(radians(v_o.lat)) * cos(radians(p_lat)) * power(sin(radians(p_lng - v_o.lng) / 2), 2)
      ));
      if v_dist < v_best then v_best := v_dist; v_best_id := v_o.id; v_best_label := v_o.label; v_best_radius := v_o.radius_m; end if;
    end loop;

    if v_best_id is null then
      v_status := 'rejected'; v_reason := 'لم يُحدّد موقع المكتب بعد — يضبطه المدير أولاً';
    elsif v_best > v_best_radius then
      v_status := 'rejected'; v_reason := 'خارج نطاق المكتب — تبعد ' || round(v_best) || 'م (الحد ' || v_best_radius || 'م)';
    end if;
  end if;

  -- (c) teleport / impossible-speed vs the user's last accepted check-in
  if v_status = 'accepted' then
    select * into v_last from public.qaf_checkins where user_id = v_uid and status = 'accepted' order by server_time desc limit 1;
    if v_last.id is not null and v_last.lat is not null then
      v_secs := extract(epoch from (now() - v_last.server_time));
      if v_secs > 0 and v_secs < 3600 then
        v_move := 2 * 6371000 * asin( sqrt(
          power(sin(radians(p_lat - v_last.lat) / 2), 2) +
          cos(radians(v_last.lat)) * cos(radians(p_lat)) * power(sin(radians(p_lng - v_last.lng) / 2), 2)
        ));
        if v_move / v_secs > 56 then   -- > ~200 km/h between two readings
          v_status := 'rejected'; v_reason := 'تحرّك غير منطقي (سرعة مفرطة) — يُراجع يدوياً';
        end if;
      end if;
    end if;
  end if;

  insert into public.qaf_checkins(
    tenant_id, user_id, employee_name, kind, lat, lng, accuracy_m,
    office_id, office_label, distance_m, ip, user_agent, status, reject_reason
  ) values (
    v_tenant, v_uid, v_name, p_kind, p_lat, p_lng, p_accuracy,
    v_best_id, v_best_label, case when v_best < 1e11 then round(v_best)::int else null end,
    v_ip, left(p_user_agent, 300), v_status, v_reason
  );

  return jsonb_build_object(
    'status', v_status, 'reason', v_reason,
    'distance', case when v_best < 1e11 then round(v_best)::int else null end,
    'office', v_best_label, 'kind', p_kind, 'at', to_char(now() at time zone 'Asia/Riyadh', 'HH24:MI')
  );
end $fn$;
grant execute on function public.qaf_check_in(double precision, double precision, real, text, text) to authenticated;

-- =============================================================================
-- DONE. Admin sets the office geofence; employees check in only via qaf_check_in.
-- =============================================================================
