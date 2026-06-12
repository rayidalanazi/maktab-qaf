-- =============================================================================
-- قاف — SETUP V6 (delta over V5): OWNER-DRAWN POLYGON attendance boundary
-- =============================================================================
-- The subscription owner (role='admin') draws the firm's attendance boundary as
-- a polygon on a map. Any employee in the firm checks in/out by being physically
-- INSIDE that polygon. The inside/outside decision is computed 100% SERVER-SIDE
-- (ray-casting in plpgsql) inside the SECURITY DEFINER qaf_check_in RPC — the map
-- only DRAWS (owner) and DISPLAYS (employee); the browser is never trusted.
-- Pure plpgsql, NO PostGIS. Idempotent. Apply on top of the live SETUP_V5.
-- =============================================================================

-- 1) SCHEMA: polygon storage; legacy circle columns become optional --------------
alter table public.qaf_office_locations alter column lat      drop not null;
alter table public.qaf_office_locations alter column lng      drop not null;
alter table public.qaf_office_locations alter column radius_m drop not null;

-- polygon = jsonb array of [lat,lng] pairs (>=3 vertices), e.g. '[[24.71,46.67],...]'
alter table public.qaf_office_locations add column if not exists polygon jsonb;
-- discriminator for the UI + the one-polygon-per-firm index
alter table public.qaf_office_locations
  add column if not exists geofence_kind text not null default 'circle';

update public.qaf_office_locations
  set geofence_kind = case when polygon is not null then 'polygon' else 'circle' end
  where geofence_kind is distinct from (case when polygon is not null then 'polygon' else 'circle' end);

-- shape guards (NOT VALID: enforce for new/updated rows without scanning legacy)
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'qaf_offices_polygon_is_array') then
    alter table public.qaf_office_locations
      add constraint qaf_offices_polygon_is_array
      check (polygon is null or jsonb_typeof(polygon) = 'array') not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'qaf_offices_shape_complete') then
    alter table public.qaf_office_locations
      add constraint qaf_offices_shape_complete
      check (
        (geofence_kind = 'circle'  and lat is not null and lng is not null and radius_m is not null)
        or (geofence_kind = 'polygon' and polygon is not null)
      ) not valid;
  end if;
end $$;

-- at most ONE polygon boundary per firm (circle branches stay unlimited)
create unique index if not exists uq_qaf_offices_one_polygon_per_tenant
  on public.qaf_office_locations (tenant_id)
  where geofence_kind = 'polygon';

-- 2) RLS + GRANTS: OWNER-ONLY write (role='admin'), firm-wide read ---------------
-- re-assert revoke-all hygiene so TRUNCATE/TRIGGER/REFERENCES can't bypass RLS
revoke all on public.qaf_office_locations from anon, authenticated;
grant select, insert, update, delete on public.qaf_office_locations to authenticated;

drop policy if exists qaf_offices_read on public.qaf_office_locations;
create policy qaf_offices_read on public.qaf_office_locations for select to authenticated
  using (tenant_id = public.qaf_current_tenant() or public.qaf_is_platform_admin());

-- TIGHTENED from ('admin','general_manager') to 'admin' only = the subscription owner
drop policy if exists qaf_offices_write on public.qaf_office_locations;
create policy qaf_offices_write on public.qaf_office_locations for all to authenticated
  using (tenant_id = public.qaf_current_tenant() and public.qaf_current_role() = 'admin')
  with check (tenant_id = public.qaf_current_tenant() and public.qaf_current_role() = 'admin');

-- =============================================================================
-- 3) POINT-IN-POLYGON  (even-odd ray casting; edge-inclusive; winding-independent)
-- -----------------------------------------------------------------------------
-- Planar on raw lat/lng is EXACT for the in/out decision: the even-odd crossing
-- count is invariant under the monotone lng->lng*cos(lat) scaling, so compressing
-- longitude can't change which side of an edge the ray crosses. (Distance is NOT
-- invariant — handled separately in qaf_dist_to_polygon_m.)
create or replace function public.qaf_point_in_polygon(
  p_lat double precision, p_lng double precision, p_poly jsonb
) returns boolean
language plpgsql immutable as $fn$
declare
  n int; i int; j int;
  inside boolean := false;
  xi double precision; yi double precision;   -- vertex i (lng, lat)
  xj double precision; yj double precision;   -- vertex j (lng, lat)
  px double precision := p_lng;               -- crossing axis (x)
  py double precision := p_lat;               -- ray axis (y)
  cross_prod double precision;
  EPS constant double precision := 1e-12;
begin
  if p_poly is null or jsonb_typeof(p_poly) <> 'array' then return false; end if;
  n := jsonb_array_length(p_poly);
  if n is null or n < 3 then return false; end if;

  j := n - 1;                                  -- first edge tested is (last -> 0): closes ring
  for i in 0 .. n - 1 loop
    begin
      yi := (p_poly -> i ->> 0)::double precision;  xi := (p_poly -> i ->> 1)::double precision;
      yj := (p_poly -> j ->> 0)::double precision;  xj := (p_poly -> j ->> 1)::double precision;
    exception when others then
      return false;
    end;
    if yi is null or xi is null or yj is null or xj is null then return false; end if;
    -- reject non-finite coords (NaN/Inf would poison comparisons)
    if not (yi = yi and xi = xi and yj = yj and xj = xj) then return false; end if;

    -- (a) inclusive boundary: p exactly on segment (i,j)?  collinear AND within bbox
    cross_prod := (xj - xi) * (py - yi) - (yj - yi) * (px - xi);
    if abs(cross_prod) <= EPS
       and px >= least(xi, xj) - EPS and px <= greatest(xi, xj) + EPS
       and py >= least(yi, yj) - EPS and py <= greatest(yi, yj) + EPS then
      return true;
    end if;

    -- (b) even-odd crossing of the +lng ray from p across edge (i,j)
    if ((yi > py) <> (yj > py)) then
      if px < (xj - xi) * (py - yi) / (yj - yi) + xi then
        inside := not inside;
      end if;
    end if;

    j := i;
  end loop;

  return inside;
end $fn$;

-- =============================================================================
-- 4) DISTANCE-TO-POLYGON in metres (min point->edge over all edges) ------------
-- Used only for the human-readable rejection message. Local equirectangular
-- frame centred on the point: x = Δlng·cos(lat)·R, y = Δlat·R. Sub-metre at <=2km.
create or replace function public.qaf_dist_to_polygon_m(
  p_lat double precision, p_lng double precision, p_poly jsonb
) returns double precision
language plpgsql immutable as $fn$
declare
  n int; i int; j int;
  R   constant double precision := 6371000;
  kx  double precision := R * pi() / 180.0 * cos(radians(p_lat));
  ky  constant double precision := R * pi() / 180.0;
  ax double precision; ay double precision; bx double precision; b_y double precision;
  alat double precision; alng double precision; blat double precision; blng double precision;
  dx double precision; dy double precision; t double precision;
  cx double precision; cy double precision; d double precision; best double precision := 1e12;
begin
  if p_poly is null or jsonb_typeof(p_poly) <> 'array' then return null; end if;
  n := jsonb_array_length(p_poly);
  if n is null or n < 2 then return null; end if;

  j := n - 1;
  for i in 0 .. n - 1 loop
    begin
      alat := (p_poly -> i ->> 0)::double precision;  alng := (p_poly -> i ->> 1)::double precision;
      blat := (p_poly -> j ->> 0)::double precision;  blng := (p_poly -> j ->> 1)::double precision;
    exception when others then j := i; continue; end;
    if alat is null or alng is null or blat is null or blng is null then j := i; continue; end if;

    ax := (alng - p_lng) * kx;  ay := (alat - p_lat) * ky;
    bx := (blng - p_lng) * kx;  b_y := (blat - p_lat) * ky;
    dx := bx - ax;  dy := b_y - ay;
    if dx = 0 and dy = 0 then
      cx := ax; cy := ay;
    else
      t := -(ax * dx + ay * dy) / (dx * dx + dy * dy);
      t := greatest(0.0, least(1.0, t));
      cx := ax + t * dx;  cy := ay + t * dy;
    end if;
    d := sqrt(cx * cx + cy * cy);
    if d < best then best := d; end if;
    j := i;
  end loop;

  return case when best < 1e11 then best else null end;
end $fn$;

-- =============================================================================
-- 5) qaf_check_in — polygon if drawn, else circle. Accept if inside ANY office.
--    All other anti-fraud preserved: accuracy gate (>100m), teleport/speed,
--    SERVER time, IP/UA log, single-writer immutable insert.
-- =============================================================================
create or replace function public.qaf_check_in(
  p_lat double precision, p_lng double precision, p_accuracy real,
  p_kind text default 'in', p_user_agent text default null
) returns jsonb
language plpgsql security definer set search_path = public as $fn$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid; v_name text;
  v_o record; v_dist double precision;
  v_best double precision := 1e12; v_best_id uuid; v_best_label text;
  v_inside boolean := false; v_have_office boolean := false; v_has_polygon boolean := false;
  v_ip text; v_status text := 'accepted'; v_reason text := null;
  v_last record; v_secs double precision; v_move double precision;
  MAX_ACC constant real := 100;
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
    -- (b) geofence: each office is a polygon (if drawn & valid) else a circle.
    -- POLYGON PRECEDENCE: if the firm has drawn ANY valid polygon, ignore circle
    -- offices entirely — a stray/legacy circle must never widen the drawn boundary.
    select exists(
      select 1 from public.qaf_office_locations
      where tenant_id = v_tenant and polygon is not null
        and jsonb_typeof(polygon) = 'array' and jsonb_array_length(polygon) >= 3
    ) into v_has_polygon;

    for v_o in select * from public.qaf_office_locations where tenant_id = v_tenant loop
      v_have_office := true;

      -- when a polygon boundary exists, skip every non-polygon (circle) office
      if v_has_polygon and not (v_o.polygon is not null and jsonb_typeof(v_o.polygon) = 'array'
         and jsonb_array_length(v_o.polygon) >= 3) then
        continue;
      end if;

      if v_o.polygon is not null and jsonb_typeof(v_o.polygon) = 'array'
         and jsonb_array_length(v_o.polygon) >= 3 then
        -- POLYGON office: server-side point-in-polygon
        if public.qaf_point_in_polygon(p_lat, p_lng, v_o.polygon) then
          v_inside := true; v_best := 0; v_best_id := v_o.id; v_best_label := v_o.label;
          exit;                                            -- inside one polygon = accept
        end if;
        v_dist := public.qaf_dist_to_polygon_m(p_lat, p_lng, v_o.polygon);  -- metres to edge
      elsif v_o.lat is not null and v_o.lng is not null then
        -- CIRCLE office (legacy / no polygon): haversine vs radius
        v_dist := 2 * 6371000 * asin( sqrt(
          power(sin(radians(p_lat - v_o.lat) / 2), 2) +
          cos(radians(v_o.lat)) * cos(radians(p_lat)) * power(sin(radians(p_lng - v_o.lng) / 2), 2)
        ));
        if v_dist <= coalesce(v_o.radius_m, 150) then
          v_inside := true; v_best := 0; v_best_id := v_o.id; v_best_label := v_o.label;
          exit;
        end if;
        v_dist := v_dist - coalesce(v_o.radius_m, 150);    -- metres OUTSIDE the perimeter
      else
        continue;                                          -- malformed office row, skip
      end if;

      if v_dist is not null and v_dist < v_best then
        v_best := v_dist; v_best_id := v_o.id; v_best_label := v_o.label;
      end if;
    end loop;

    if not v_have_office then
      v_status := 'rejected'; v_reason := 'لم يُحدّد نطاق المكتب بعد — يرسمه مالك الاشتراك أولاً';
    elsif not v_inside then
      v_status := 'rejected';
      v_reason := 'خارج نطاق المكتب — تبعد ~' || round(greatest(v_best, 0)) || 'م عن أقرب حدود';
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
        if v_move / v_secs > 56 then
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
    v_best_id, v_best_label, case when v_best < 1e11 then round(greatest(v_best, 0))::int else null end,
    v_ip, left(p_user_agent, 300), v_status, v_reason
  );

  return jsonb_build_object(
    'status', v_status, 'reason', v_reason,
    'distance', case when v_best < 1e11 then round(greatest(v_best, 0))::int else null end,
    'office', v_best_label, 'kind', p_kind, 'at', to_char(now() at time zone 'Asia/Riyadh', 'HH24:MI')
  );
end $fn$;

grant execute on function public.qaf_check_in(double precision, double precision, real, text, text) to authenticated;
-- helpers are NOT granted to authenticated: the definer RPC calls them as owner;
-- not granting avoids exposing a client-side in/out oracle (geometry is already
-- firm-readable via the table, but keep the surface minimal).

-- =============================================================================
-- DONE V6. Owner (admin) draws the polygon; every firm member checks in via RPC.
-- =============================================================================
