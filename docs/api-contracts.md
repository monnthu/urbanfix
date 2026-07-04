# API contracts (MVP)

Shared between `apps/web` and `apps/mobile`. All authenticated calls use Supabase JWT unless noted.

## Report categories

`pothole` | `streetlight` | `garbage` | `water_leak` | `flooding` | `other`

## Priority levels

`low` | `medium` | `high` | `critical`

## REST / Supabase tables

### `profiles`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | FK to auth.users |
| role | text | `civilian` \| `institution` \| `admin` |
| display_name | text | |
| institution_id | uuid | nullable, set for institution users |
| mfa_enrolled | boolean | |

### `reports`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| title | text | |
| description | text | |
| category | text | user-selected |
| ai_category | text | nullable |
| priority | text | user or system default |
| ai_priority | text | nullable |
| latitude | float | |
| longitude | float | |
| address_text | text | optional |
| image_url | text | Supabase storage URL |
| status | text | `open` \| `in_progress` \| `resolved` |
| civilian_user_id | uuid | |
| assigned_institution_id | uuid | nullable |

### `report_supports`

Unique on `(report_id, user_id)`.

## Server API routes (Next.js)

Base: `/api`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reports` | civilian | Create report, route to institution, trigger AI analysis |
| POST | `/api/reports/[id]/support` | civilian | Add support/verify |
| POST | `/api/ai/analyze-image` | civilian | Gemini category + priority (also called on report create) |
| POST | `/api/ai/institution-chat` | institution | Scoped Q&A over assigned reports |

## Mobile notes

- Read reports / map: Supabase client + RLS.
- Create report with image: upload to Storage, then POST `/api/reports` with image URL.
- OAuth: use Supabase deep link / WebAuthenticator flow (see mobile README).
