import { NextResponse } from "next/server";

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

  return NextResponse.json({
    ok: true,
    service: "civic-reporting-web",
    supabaseConfigured,
    geminiConfigured,
  });
}
