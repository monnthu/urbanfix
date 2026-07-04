import type { ReportStatus } from "@/lib/constants";
import type { Report } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchAssignedReports(
  supabase: SupabaseClient,
  institutionId: string,
  status?: ReportStatus | "all"
): Promise<Report[]> {
  let query = supabase
    .from("reports")
    .select("*")
    .eq("assigned_institution_id", institutionId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Report[];
}

export async function updateReportStatus(
  supabase: SupabaseClient,
  reportId: string,
  institutionId: string,
  status: ReportStatus
): Promise<Report> {
  const { data, error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId)
    .eq("assigned_institution_id", institutionId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Report not found or not assigned to you");
  }

  return data as Report;
}
