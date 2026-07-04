# Demo script (20-hour MVP)

## Actors

- **Civilian (web)** — Google sign-in + TOTP
- **Civilian (mobile)** — same account on MAUI Android app
- **Institution** — approved official-domain user on web dashboard
- **Admin** — approves institution application

## Flow

1. **Institution onboarding**
   - Institution user applies with official email domain.
   - Admin approves in web admin route or Supabase dashboard.
   - n8n webhook fires (optional notification).

2. **Civilian report (mobile)**
   - Sign in with Google.
   - Submit pothole report with photo and GPS/zone.
   - AI suggests category and priority on upload.

3. **Community support (web or mobile)**
   - Open map → see report pin with category icon.
   - Open report → tap Support/Verify once.

4. **Institution triage (web)**
   - Log in as institution user.
   - See assigned reports only.
   - Ask AI: "Show open flooding reports in Zone 3 from the last week."
   - Ask AI about a specific report ID.

5. **Map**
   - Web Leaflet map with legend.
   - Mobile map/WebView map with same category icons.

## Demo data

Use `supabase/seed.sql` for zones, institutions, and sample reports.
