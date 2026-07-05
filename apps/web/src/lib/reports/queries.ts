import { ReportStatus, isReportStatus } from "@/lib/constants";
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
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false });

  if (status !== undefined && status !== "all") {
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
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", reportId)
    .eq("institution_id", institutionId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Reporte no encontrado o no asignado a tu institución");
  }

  return data as Report;
}

export function parseReportStatus(value: unknown): ReportStatus | null {
  if (typeof value === "number" && isReportStatus(value)) {
    return value;
  }
  return null;
}
