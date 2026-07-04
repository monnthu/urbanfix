# Civic Reporting Platform

Civic reporting web and mobile platform for urban problem reports routed to verified government institutions.

## Monorepo structure

```
apps/
  web/          Next.js web app (civilian, institution, admin)
  mobile/       .NET MAUI mobile app (civilian flows)
docs/           Setup, API contracts, demo script
supabase/       Database migrations and seed data
```

## Prerequisites

- **Web:** Node.js 20+ and npm
- **Mobile:** .NET SDK 9+ and Visual Studio Insiders with .NET MAUI workload
- **Backend:** Supabase account (free tier)
- **Hosting:** Vercel account (free tier)
- **AI:** Google AI Studio / Gemini API key

## Quick start

### 1. Clone and open

```powershell
cd C:\Users\hashi\Projects\civic-reporting
```

Open this folder in Cursor for web/backend work. Open `apps/mobile` in Visual Studio Insiders for MAUI.

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `apps/web/.env.local` and fill in values.
3. Run migrations from `supabase/migrations/` (see `docs/setup-supabase.md`).

### 3. Web app

```powershell
cd apps/web
npm install
npm run dev
```

### 4. Mobile app

Open `apps/mobile/CivicReporting.Mobile.csproj` in Visual Studio Insiders, select Android emulator, and run.

## Team workflow

- `main` — deployable MVP
- Feature branches: `feat/web-auth`, `feat/mobile-maui`, `feat/reports-map`, `feat/ai`, `feat/institution-dashboard`
- Small PRs with at least one review

## Docs

- [Local dev setup](docs/setup-local-dev.md) — install Node, Git, run web + mobile
- [Setup — Supabase](docs/setup-supabase.md)
- [API contracts](docs/api-contracts.md)
- [Demo script](docs/demo-script.md)
