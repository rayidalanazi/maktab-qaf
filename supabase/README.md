# قاف — Supabase Setup

This folder contains the database design + migration files for قاف.

## What's here

- `migrations/` — SQL files to run in order on your Supabase project.
- `_design.json` — Full architecture spec (8 categories, 3 adversarial critiques).

## Migration order

1. `001_enums.sql` — All status/type enums
2. `002_platform_tables.sql` — Tenants, subscriptions, addons, payments, audit, support
3. `003_users_and_auth.sql` — public.users + invitations + JWT custom claims hook
4. `004_tenant_data_tables.sql` — Cases, documents, memos, schedule, tasks, notifications, invoices
5. `005_rls_policies.sql` — Row Level Security for hard tenant isolation

## Apply to a Supabase project

```bash
# Install the Supabase CLI
npm i -g supabase

# Link to your project
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>

# Apply migrations
supabase db push
```

Or paste each `.sql` file in order into the Supabase SQL editor.

## After migration

1. In the Supabase dashboard → Authentication → Hooks:
   - Enable "Custom Access Token" hook
   - Point it at `public.custom_access_token_hook`

2. In Authentication → Providers:
   - Enable Email/Password
   - Enable Google (using the same OAuth client as the lawyer-payments project)

3. Storage:
   - Create bucket `documents` (private)
   - Create bucket `tenant-assets` (private, for logos/avatars)

4. Insert the first platform admin manually:

```sql
insert into public.platform_admins (user_id, role)
values ('<YOUR_AUTH_USER_ID>', 'admin');
```

## Env vars

Fill in `.env.local` (copy from `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```
