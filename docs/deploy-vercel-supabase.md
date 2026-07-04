# Deploy to Vercel + Supabase (tryout)

Follow these steps to get a live demo URL.

## Part 1 — Supabase (≈10 min)

### 1. Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Choose a name (e.g. `urbanfix`), set a DB password, pick a region close to your users.
3. Wait for the project to finish provisioning.

### 2. Run database migrations

In **SQL Editor** → **New query**, run these files **in order**:

1. Copy/paste all of [`supabase/migrations/001_initial_schema.sql`](../../supabase/migrations/001_initial_schema.sql) → **Run**.
2. Copy/paste all of [`supabase/migrations/002_institution_policies.sql`](../../supabase/migrations/002_institution_policies.sql) → **Run**.
3. Copy/paste all of [`supabase/seed.sql`](../../supabase/seed.sql) → **Run**.

### 3. Create storage bucket

1. **Storage** → **New bucket** → name: `report-images` → **Public bucket** → Create.
2. In SQL Editor, run:

```sql
create policy "Authenticated users can upload report images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'report-images');

create policy "Anyone can view report images"
on storage.objects for select
using (bucket_id = 'report-images');
```

### 4. Enable Google auth (optional for tryouts)

1. **Authentication** → **Providers** → **Google** → Enable.
2. Use [Google Cloud Console](https://console.cloud.google.com/) OAuth credentials.
3. Add redirect URLs (replace with your values):
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_VERCEL_URL/auth/callback`
   - `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### 5. Copy API keys

**Project Settings** → **API**:

| Key | Env variable |
|-----|--------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role | `SUPABASE_SERVICE_ROLE_KEY` |

---

## Part 2 — Local tryout (optional)

```powershell
cd apps/web
copy .env.example .env.local
# Edit .env.local with Supabase keys + GEMINI_API_KEY
npm install
npm run dev
```

Open http://localhost:3000

---

## Part 3 — Vercel deploy

### Option A: Vercel dashboard (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) → Import **monnthu/urbanfix** from GitHub.
2. **Root Directory:** `apps/web` ← important for monorepo.
3. **Environment variables** (Production + Preview):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `GEMINI_API_KEY` | your Gemini key (optional; AI features) |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

4. Deploy.

After deploy, update Supabase **Authentication → URL configuration**:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** add `https://your-app.vercel.app/auth/callback`

### Option B: Vercel CLI

```powershell
npm i -g vercel
cd apps/web
vercel login
vercel --prod
```

Set env vars in the Vercel dashboard or via `vercel env add`.

---

## Part 4 — Demo institution user (for `/institution`)

After you sign up once via the app (or Supabase Auth), run in SQL Editor:

```sql
-- Replace YOUR_USER_UUID with the auth.users id from Authentication → Users
update public.profiles
set role = 'institution',
    institution_id = '11111111-1111-1111-1111-111111111101'
where id = 'YOUR_USER_UUID';
```

Institution `11111111-...101` is **Public Works Dept** from seed data.

---

## Verify deployment

| Check | URL / action |
|-------|----------------|
| Home loads | `/` |
| Health API | `/api/health` → `{ "ok": true }` |
| Institution dashboard | `/institution` (after institution user setup) |
| Reports list | `/reports` |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Vercel | Confirm Root Directory = `apps/web` |
| Auth redirect error | Add Vercel URL to Supabase redirect URLs |
| AI errors | Add `GEMINI_API_KEY`; get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Empty institution dashboard | Assign `institution_id` on profile + create reports with `assigned_institution_id` |
