import { requireInstitutionUser } from "@/lib/auth/require-institution";
import { answerInstitutionQuestion } from "@/lib/gemini/institution-chat";
import { geminiErrorResponse } from "@/lib/gemini/client";
import { fetchAssignedReports } from "@/lib/reports/queries";
import { NextResponse } from "next/server";

type ChatBody = {
  question: string;
  reportId?: string;
};

export async function POST(request: Request) {
  const auth = await requireInstitutionUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: ChatBody;

  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.question?.trim()) {
    return NextResponse.json({ error: "question es obligatorio" }, { status: 400 });
  }

  try {
    const assignedReports = await fetchAssignedReports(
      auth.supabase,
      auth.institution.id
    );

    const question = body.reportId
      ? `${body.question.trim()} (enfócate en el reporte id ${body.reportId})`
      : body.question.trim();

    const result = await answerInstitutionQuestion(question, assignedReports);

    return NextResponse.json(result);
  } catch (error) {
    const { status, body: errorBody } = geminiErrorResponse(error);
    return NextResponse.json(errorBody, { status });
  }
}
