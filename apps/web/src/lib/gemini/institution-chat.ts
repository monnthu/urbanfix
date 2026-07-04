import { REPORT_CATEGORIES, type ReportStatus } from "@/lib/constants";
import { generateContent } from "@/lib/gemini/client";
import type { InstitutionChatResponse, Report } from "@/lib/types";

export type ReportFilters = {
  status?: ReportStatus;
  category?: string;
  zone?: string;
  sinceDays?: number;
  reportId?: string;
};

function extractFilters(question: string): ReportFilters {
  const lower = question.toLowerCase();
  const filters: ReportFilters = {};

  if (/\bopen\b/.test(lower)) filters.status = "open";
  if (/\bin progress\b|\bin_progress\b/.test(lower)) filters.status = "in_progress";
  if (/\bresolved\b/.test(lower)) filters.status = "resolved";

  for (const category of REPORT_CATEGORIES) {
    if (lower.includes(category.replace("_", " ")) || lower.includes(category)) {
      filters.category = category;
      break;
    }
  }

  const zoneMatch = lower.match(/zone[\s_-]?(\d+)/);
  if (zoneMatch) {
    filters.zone = `zone_${zoneMatch[1]}`;
  }

  if (/last week|past week|7 days/.test(lower)) {
    filters.sinceDays = 7;
  } else if (/last month|past month|30 days/.test(lower)) {
    filters.sinceDays = 30;
  }

  const uuidMatch = question.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  if (uuidMatch) {
    filters.reportId = uuidMatch[0];
  }

  return filters;
}

export function filterAssignedReports(
  reports: Report[],
  filters: ReportFilters
): Report[] {
  let result = [...reports];

  if (filters.reportId) {
    return result.filter((report) => report.id === filters.reportId);
  }

  if (filters.status) {
    result = result.filter((report) => report.status === filters.status);
  }

  if (filters.category) {
    result = result.filter(
      (report) =>
        report.category === filters.category ||
        report.ai_category === filters.category
    );
  }

  if (filters.zone) {
    result = result.filter((report) =>
      (report.address_text || "").toLowerCase().includes(filters.zone!)
    );
  }

  if (filters.sinceDays) {
    const cutoff = Date.now() - filters.sinceDays * 24 * 60 * 60 * 1000;
    result = result.filter(
      (report) => new Date(report.created_at).getTime() >= cutoff
    );
  }

  return result.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function summarizeReports(reports: Report[]): string {
  if (reports.length === 0) {
    return "No matching reports.";
  }

  return reports
    .slice(0, 20)
    .map(
      (report) =>
        `- id=${report.id}; title=${report.title}; category=${report.category}; ai_category=${report.ai_category ?? "n/a"}; priority=${report.priority}; ai_priority=${report.ai_priority ?? "n/a"}; status=${report.status}; address=${report.address_text ?? "n/a"}; created_at=${report.created_at}; description=${report.description.slice(0, 180)}`
    )
    .join("\n");
}

export async function answerInstitutionQuestion(
  question: string,
  assignedReports: Report[]
): Promise<InstitutionChatResponse> {
  const filters = extractFilters(question);
  const matched = filterAssignedReports(assignedReports, filters);

  const context = summarizeReports(matched);
  const prompt = `You are an assistant for a verified government institution reviewing civic reports.

Answer ONLY using the report data below. If the answer is not in the data, say you do not have enough assigned report data.

When referencing reports, mention their ids explicitly.

User question:
${question}

Assigned report data (${matched.length} matches):
${context}`;

  const answer = await generateContent({ text: prompt });

  return {
    answer,
    referencedReportIds: matched.slice(0, 20).map((report) => report.id),
    reportsUsed: matched.length,
  };
}
