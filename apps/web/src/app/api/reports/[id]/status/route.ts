import { requireInstitutionUser } from "@/lib/auth/require-institution";
import { ReportStatus, isReportStatus } from "@/lib/constants";
import { parseReportStatus, updateReportStatus } from "@/lib/reports/queries";
import { NextResponse } from "next/server";

type StatusBody = {
  status: number;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireInstitutionUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  let body: StatusBody;

  try {
    body = (await request.json()) as StatusBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const status = parseReportStatus(body.status);
  if (status === null || !isReportStatus(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  try {
    const report = await updateReportStatus(
      auth.supabase,
      id,
      auth.institution.id,
      status
    );

    return NextResponse.json({ report });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo actualizar el reporte";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
