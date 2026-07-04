# Supabase setup

## 1. Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Note your **Project URL** and **anon key** (Settings → API).
3. Note your **service role key** for server-only API routes (never expose in mobile or browser).

## 2. Environment variables

Copy `apps/web/.env.example` to `apps/web/.env.local`:

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (server only) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |

Mobile app: set the same Supabase URL and anon key in `apps/mobile/appsettings.Development.json` (see mobile README).

## 3. Run migrations

Using Supabase CLI (optional):

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Or paste SQL from `supabase/migrations/001_initial_schema.sql` into the Supabase SQL Editor and run.

## 4. Storage

Create a public bucket `report-images` in Storage, or run the migration which includes bucket policy notes.

## 5. Auth

1. Enable **Google** provider under Authentication → Providers.
2. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - Your Vercel preview/production URLs + `/auth/callback`
3. Enable **TOTP MFA** under Authentication → Multi-Factor Authentication.

## 6. Seed data

Run `supabase/seed.sql` in the SQL Editor after migrations.
