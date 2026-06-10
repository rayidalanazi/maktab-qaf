-- =============================================================================
-- قاف — SEED a real demo office linked to YOUR account
-- =============================================================================
-- Creates the "raed" firm, makes saudiicoder@gmail.com its admin, and fills it
-- with realistic Saudi legal data so you see a complete office on first login.
--
-- Safe: only touches qaf_* objects. Idempotent: re-running won't duplicate data
-- (it skips seeding if the firm already has cases).
--
-- PREREQ: you must have signed in at least once (so an auth.users row exists).
-- RUN: Supabase → SQL Editor → paste ALL → Run.
-- =============================================================================

-- The documents list shows a case number; add the display column if missing.
alter table public.qaf_documents add column if not exists case_number text;

do $$
declare
  v_uid uuid;
  v_email text;
  v_tenant uuid;
  v_has_data int;
begin
  -- 1) Find your auth user.
  select id, email into v_uid, v_email
    from auth.users where lower(email) = 'saudiicoder@gmail.com'
    order by created_at limit 1;
  if v_uid is null then
    raise exception 'No auth user for saudiicoder@gmail.com — sign in once on the site, then re-run this seed.';
  end if;

  -- 2) Create (or reuse) the "raed" firm.
  select id into v_tenant from public.qaf_tenants where slug = 'raed';
  if v_tenant is null then
    insert into public.qaf_tenants
      (slug, name, name_en, email_domain, plan, status, trial_ends_at, enabled_addons)
    values
      ('raed','شركة رائد للمحاماة','Raed Law Firm','raed-law.sa','bundle_medium','active',
       now() + interval '30 days',
       array['core_cases','case_timeline_plus','memos_module','templates_library',
             'schedule_attendance','documents_vault','invoicing_pro','reports_basic'])
    returning id into v_tenant;
  end if;

  -- 3) Make you the firm admin.
  insert into public.qaf_users
    (id, tenant_id, role, status, full_name, email, initials, last_seen_at)
  values
    (v_uid, v_tenant, 'admin', 'active', 'عبدالله العتيبي', v_email, 'عا', now())
  on conflict (id) do update
    set tenant_id = excluded.tenant_id, role = 'admin', status = 'active';

  -- 4) Seed data ONCE (skip if the firm already has cases).
  select count(*) into v_has_data from public.qaf_cases where tenant_id = v_tenant;
  if v_has_data > 0 then
    raise notice 'Firm "raed" already has data — skipping seed.';
    return;
  end if;

  -- ---- Cases ----
  insert into public.qaf_cases
    (tenant_id, case_number, court, case_type, status, status_label, plaintiff, defendant, current_action, filing_date, deadline, risk_score, assigned_to_name)
  values
    (v_tenant,'2026/0142','المحكمة العامة بالرياض','تجاري','hearing_scheduled','نشط','شركة النجم التجارية','محمد عبدالله الحربي','جلسة قادمة','2026-01-12','2026-05-25',2,'عبدالله العتيبي'),
    (v_tenant,'2026/0099','محكمة الأحوال الشخصية','أحوال شخصية','in_progress','نشط','سارة أحمد القحطاني','خالد سعد الدوسري','تقديم دفاع','2026-02-03','2026-05-12',3,'محمد الفهيد'),
    (v_tenant,'2025/3201','المحكمة العمالية','عمالي','awaiting_judgment','معلق','عبدالرحمن خالد','شركة البناء الذهبي','بانتظار الحكم','2025-09-20','2026-06-08',2,'محمد الفهيد'),
    (v_tenant,'2026/0211','المحكمة الجزائية','جزائي','in_progress','نشط','النيابة العامة','فهد محمد العسيري','تحضير المرافعة','2026-02-22','2026-05-30',4,'عبدالله العتيبي'),
    (v_tenant,'2025/2890','المحكمة التجارية','تجاري','won','مغلق','مؤسسة الخليج الصناعية','مصنع الأمجاد','صدر الحكم','2025-06-10','2025-12-15',1,'عبدالله العتيبي'),
    (v_tenant,'2026/0307','محكمة التنفيذ بجدة','تنفيذي','hearing_scheduled','نشط','بنك الراجحي','شركة المنارة العقارية','تنفيذ الحكم','2026-03-01','2026-06-15',2,'محمد الفهيد'),
    (v_tenant,'2026/0156','المحكمة العامة بالدمام','مدني','in_progress','نشط','يوسف إبراهيم العمر','شركة المقاولات المتحدة','الاستئناف','2026-01-30','2026-05-18',3,'فاطمة الصالح'),
    (v_tenant,'2026/0341','محكمة الاستئناف بالرياض','تجاري','hearing_scheduled','نشط','شركة بيان للتقنية','مؤسسة الوادي للتجارة','مذكرة جوابية','2026-03-18','2026-06-20',3,'فاطمة الصالح');

  -- ---- Schedule events ----
  insert into public.qaf_schedule_events
    (tenant_id, event_type, title, description, event_date, event_time, location)
  values
    (v_tenant,'جلسة','جلسة قضية 2026/0142','المحكمة العامة بالرياض - قاعة 3','2026-05-15','09:00','الرياض'),
    (v_tenant,'اجتماع','اجتماع مع العميل سارة القحطاني','مكتب المحامي الرئيسي','2026-05-08','11:00','المكتب'),
    (v_tenant,'موعد نهائي','تقديم دفاع - قضية 2026/0099','يجب التقديم قبل الساعة 12 ظهراً','2026-05-12','08:00','ناجز'),
    (v_tenant,'مهمة','مراجعة عقد توريد','شركة النجم التجارية','2026-05-10','14:00','المكتب'),
    (v_tenant,'جلسة','جلسة قضية 2026/0211','المحكمة الجزائية','2026-05-18','10:30','الرياض'),
    (v_tenant,'جلسة','جلسة تنفيذ 2026/0307','محكمة التنفيذ بجدة','2026-05-22','12:00','جدة');

  -- ---- Tasks ----
  insert into public.qaf_tasks
    (tenant_id, title, status, priority, due_date, owner_name)
  values
    (v_tenant,'تحضير مذكرة الدفاع لقضية 2026/0099','in_progress','عالية','2026-05-12','عبدالله العتيبي'),
    (v_tenant,'متابعة العميل بنك الراجحي للتحصيل','todo','متوسطة','2026-05-15','محمد الفهيد'),
    (v_tenant,'إغلاق ملف قضية 2025/2890','todo','منخفضة','2026-05-20','عبدالله العتيبي'),
    (v_tenant,'تجديد ترخيص شركة النجم','in_progress','عالية','2026-05-14','فاطمة الصالح'),
    (v_tenant,'إعداد فاتورة أتعاب قضية 2026/0156','todo','متوسطة','2026-05-17','فاطمة الصالح'),
    (v_tenant,'رفع صحيفة استئناف 2026/0341','todo','عالية','2026-05-19','فاطمة الصالح');

  -- ---- Documents ----
  insert into public.qaf_documents
    (tenant_id, name, file_type, size_label, case_number, uploader_name, created_at)
  values
    (v_tenant,'عقد توكيل - النجم التجارية','PDF','245 KB','2026/0142','عبدالله العتيبي','2026-04-28'),
    (v_tenant,'محضر جلسة 2026/0099','PDF','180 KB','2026/0099','محمد الفهيد','2026-04-22'),
    (v_tenant,'مذكرة دفاع','DOCX','95 KB','2026/0099','عبدالله العتيبي','2026-05-02'),
    (v_tenant,'صورة هوية الموكل','JPG','1.2 MB','2026/0211','نورة الحربي','2026-05-01'),
    (v_tenant,'حكم محكمة 2025/2890','PDF','312 KB','2025/2890','عبدالله العتيبي','2025-11-20'),
    (v_tenant,'عقد إيجار محل تجاري','PDF','445 KB','2026/0156','فاطمة الصالح','2026-04-15');

  -- ---- Invoices (VAT 15%) ----
  insert into public.qaf_invoices
    (tenant_id, client_name, invoice_number, amount_sar, vat_sar, total_sar, status, issued_at, due_at)
  values
    (v_tenant,'شركة النجم التجارية','INV-2026-014',20000,3000,23000,'paid','2026-04-01','2026-04-15'),
    (v_tenant,'سارة أحمد القحطاني','INV-2026-018',8000,1200,9200,'sent','2026-04-20','2026-05-20'),
    (v_tenant,'بنك الراجحي','INV-2026-021',35000,5250,40250,'partially_paid','2026-04-25','2026-05-25'),
    (v_tenant,'يوسف إبراهيم العمر','INV-2026-024',12000,1800,13800,'overdue','2026-03-15','2026-04-15'),
    (v_tenant,'شركة بيان للتقنية','INV-2026-029',18000,2700,20700,'draft','2026-05-01','2026-06-01');

  -- ---- Expenses ----
  insert into public.qaf_expenses
    (tenant_id, item, amount_sar, category, paid_by, status, case_number, spent_at)
  values
    (v_tenant,'رسوم محكمة - قضية 2026/0142',1500,'رسوم حكومية','عبدالله العتيبي','معتمد','2026/0142','2026-04-10'),
    (v_tenant,'أتعاب خبير محاسبي',5000,'خبراء','المكتب','معتمد','2025/3201','2026-04-12'),
    (v_tenant,'تكاليف ترجمة مستندات',800,'خدمات','نورة الحربي','بانتظار','2026/0156','2026-04-18'),
    (v_tenant,'رسوم تنفيذ - قضية 2026/0307',2200,'رسوم حكومية','محمد الفهيد','معتمد','2026/0307','2026-04-22'),
    (v_tenant,'اشتراك ناجز السنوي',1200,'اشتراكات','المكتب','معتمد',null,'2026-01-05'),
    (v_tenant,'مصاريف سفر جلسة الدمام',950,'سفر','فاطمة الصالح','بانتظار','2026/0156','2026-05-02');

  -- ---- Clients ----
  insert into public.qaf_clients
    (tenant_id, name, type, contact, status, lawyer_name)
  values
    (v_tenant,'شركة النجم التجارية','company','0551234567','نشط','عبدالله العتيبي'),
    (v_tenant,'سارة أحمد القحطاني','individual','0567654321','نشط','محمد الفهيد'),
    (v_tenant,'بنك الراجحي','company','0112990000','نشط','محمد الفهيد'),
    (v_tenant,'يوسف إبراهيم العمر','individual','0509988776','نشط','فاطمة الصالح'),
    (v_tenant,'شركة بيان للتقنية','company','0533221144','نشط','فاطمة الصالح'),
    (v_tenant,'مؤسسة الخليج الصناعية','company','0138123456','غير نشط','عبدالله العتيبي');

  -- ---- Memos ----
  insert into public.qaf_memos
    (tenant_id, title, memo_type, status, author_name, due_date)
  values
    (v_tenant,'مذكرة دفاع - قضية 2026/0099','دفاع','draft','عبدالله العتيبي','2026-05-12'),
    (v_tenant,'لائحة اعتراضية - قضية 2026/0156','اعتراض','review','فاطمة الصالح','2026-05-18'),
    (v_tenant,'مذكرة جوابية - قضية 2026/0341','جواب','draft','فاطمة الصالح','2026-06-15'),
    (v_tenant,'مذكرة تنفيذ - قضية 2026/0307','تنفيذ','final','محمد الفهيد','2026-05-22'),
    (v_tenant,'استشارة عقد توريد','استشارة','final','عبدالله العتيبي',null);

  -- ---- Notifications ----
  insert into public.qaf_notifications
    (tenant_id, target_user_id, title, description, urgency, is_read, created_at)
  values
    (v_tenant, v_uid,'🚨 قضية متجاوزة الحد الزمني','قضية 2025/3201 تجاوزت الحد الأقصى للمرافعة','red',false, now() - interval '5 minutes'),
    (v_tenant, v_uid,'⚠ موعد جلسة قريب','جلسة قضية 2026/0142 بعد 7 أيام','yellow',false, now() - interval '30 minutes'),
    (v_tenant, v_uid,'🚨 موعد نهائي عاجل','تقديم دفاع قضية 2026/0099 خلال 3 أيام','red',false, now() - interval '1 hour'),
    (v_tenant, v_uid,'📋 فاتورة متأخرة','الفاتورة INV-2026-024 تجاوزت موعد الاستحقاق','yellow',false, now() - interval '3 hours'),
    (v_tenant, v_uid,'✓ تم اعتماد المصروف','اعتمد المدير مصروف رسوم محكمة 1500 ر.س','green',true, now() - interval '1 day');

  raise notice 'Seeded firm "raed" (%) for user %', v_tenant, v_uid;
end $$;

-- =============================================================================
-- DONE. Sign in at https://rayidalanazi.github.io/maktab-qaf/login → /t/raed
-- now shows YOUR real office data (no mock).
-- =============================================================================
