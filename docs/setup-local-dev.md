# Local development setup

## Required tools

| Tool | Purpose | Install |
|------|---------|---------|
| **Node.js 20+** | Next.js web app | [nodejs.org](https://nodejs.org/) |
| **Git** | Version control / GitHub | [git-scm.com](https://git-scm.com/download/win) |
| **.NET SDK 10+** | MAUI mobile app | Already installed (`dotnet --version`) |
| **Visual Studio Insiders** | MAUI debugging | With **.NET MAUI** workload |
| **Supabase account** | Database, auth, storage | [supabase.com](https://supabase.com) |

After installing Node and Git, **restart Cursor/terminal** so PATH updates.

## Verify installs

```powershell
node --version
npm --version
git --version
dotnet --version
```

## Initialize Git and push to GitHub

```powershell
cd C:\Users\hashi\Projects\civic-reporting
git init
git add .
git commit -m "Initial monorepo scaffold: web, MAUI mobile, Supabase schema"
```

Create a new repo on GitHub, then:

```powershell
git remote add origin https://github.com/YOUR_ORG/civic-reporting.git
git branch -M main
git push -u origin main
```

## Run web app

```powershell
cd apps\web
copy .env.example .env.local
# Edit .env.local with Supabase + Gemini keys
npm install
npm run dev
```

Open http://localhost:3000

## Run mobile app

1. Open `apps\mobile\CivicReporting.Mobile.csproj` in Visual Studio Insiders.
2. Set Android emulator as target.
3. Press Run (F5).

## Next build steps (team order)

1. Run Supabase migration + seed (`docs/setup-supabase.md`)
2. Person 2: Google OAuth + TOTP MFA on web
3. Person 3: Report form + map on web
4. Person 5: MAUI auth + report form
5. Person 4: Institution dashboard + Gemini AI routes
