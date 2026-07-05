import {
  ReportCategory,
  ReportStatus,
  SLUG_TO_CATEGORY,
  SLUG_TO_STATUS,
  categoryLabel,
  priorityLabel,
  statusLabel,
} from "@/lib/constants";
import { generateContent } from "@/lib/gemini/client";
import type { InstitutionChatResponse, Report } from "@/lib/types";

export type ReportFilters = {
  status?: ReportStatus;
  category?: ReportCategory;
  zone?: string;
  sinceDays?: number;
  reportId?: string;
};

function extractFilters(question: string): ReportFilters {
  const lower = question.toLowerCase();
  const filters: ReportFilters = {};

  for (const [slug, status] of Object.entries(SLUG_TO_STATUS)) {
    if (lower.includes(slug)) {
      filters.status = status;
      break;
    }
  }

  for (const [slug, category] of Object.entries(SLUG_TO_CATEGORY)) {
    if (lower.includes(slug)) {
      filters.category = category;
      break;
    }
  }

  const zoneMatch = lower.match(/zone[\s_-]?(\d+)|zona[\s_-]?(\d+)/);
  if (zoneMatch) {
    filters.zone = `zone_${zoneMatch[1] ?? zoneMatch[2]}`;
  }

  if (/last week|past week|7 days|última semana|ultima semana/.test(lower)) {
    filters.sinceDays = 7;
  } else if (/last month|past month|30 days|último mes|ultimo mes/.test(lower)) {
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

  if (filters.status !== undefined) {
    result = result.filter((report) => report.status === filters.status);
  }

  if (filters.category !== undefined) {
    result = result.filter((report) => report.category === filters.category);
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
    return "No hay reportes coincidentes.";
  }

  return reports
    .slice(0, 20)
    .map(
      (report) =>
        `- id=${report.id}; title=${report.title}; category=${categoryLabel(report.category)}; priority=${priorityLabel(report.priority)}; status=${statusLabel(report.status)}; ai_category=${report.ai_category ?? "n/a"}; ai_priority=${report.ai_priority ?? "n/a"}; created_at=${report.created_at}; description=${report.description.slice(0, 180)}`
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
  const prompt = `Eres un asistente para una institución gubernamental verificada que revisa reportes cívicos.

Responde SOLO usando los datos de reportes asignados abajo. Si no hay datos suficientes, dilo claramente.

Menciona ids de reportes cuando corresponda.

Pregunta del usuario:
${question}

Reportes asignados (${matched.length} coincidencias):
${context}`;

  const answer = await generateContent({ text: prompt });

  return {
    answer,
    referencedReportIds: matched.slice(0, 20).map((report) => report.id),
    reportsUsed: matched.length,
  };
}
