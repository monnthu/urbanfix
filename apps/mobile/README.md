# Civic Reporting — Mobile (.NET MAUI)

Built with **Visual Studio Insiders** and .NET MAUI.

## Open in Visual Studio Insiders

1. Open `CivicReporting.Mobile.csproj` in Visual Studio Insiders.
2. Ensure the **.NET Multi-platform App UI development** workload is installed.
3. Select **Android** as the target (MVP default).
4. Run on emulator or physical device.

## Configuration

Edit `appsettings.Development.json`:

```json
{
  "Supabase": {
    "Url": "https://YOUR_PROJECT.supabase.co",
    "AnonKey": "your-anon-key"
  },
  "Api": {
    "BaseUrl": "http://10.0.2.2:3000"
  }
}
```

Use `10.0.2.2` for Android emulator to reach host machine `localhost:3000`.

## MVP screens (to implement)

- Sign in (Supabase Google OAuth via WebAuthenticator)
- New report (photo + location)
- Report list + support
- Map with category icons and legend

## Shared contracts

See [docs/api-contracts.md](../../docs/api-contracts.md).
