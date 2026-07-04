import { requireInstitutionUser } from "@/lib/auth/require-institution";
import { REPORT_STATUSES, type ReportStatus } from "@/lib/constants";
import { updateReportStatus } from "@/lib/reports/queries";
import { NextResponse } from "next/server";

type StatusBody = {
  status: ReportStatus;
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
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!REPORT_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const report = await updateReportStatus(
      auth.supabase,
      id,
      auth.profile.institution_id!,
      body.status
    );

    return NextResponse.json({ report });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update report";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
