import { requireAuthenticatedUser } from "@/lib/auth/require-institution";
import { analyzeReportImage } from "@/lib/gemini/analyze-image";
import { geminiErrorResponse } from "@/lib/gemini/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type AnalyzeImageBody = {
  imageUrl: string;
  description?: string;
  reportId?: string;
};

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: AnalyzeImageBody;

  try {
    body = (await request.json()) as AnalyzeImageBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  try {
    const analysis = await analyzeReportImage(body.imageUrl, body.description);

    if (body.reportId) {
      try {
        const admin = createAdminClient();
        await admin
          .from("reports")
          .update({
            ai_category: analysis.category,
            ai_priority: analysis.priority,
          })
          .eq("id", body.reportId)
          .eq("civilian_user_id", auth.user.id);
      } catch {
        // Non-blocking if admin credentials are not configured yet.
      }
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    const { status, body: errorBody } = geminiErrorResponse(error);
    return NextResponse.json(errorBody, { status });
  }
}
