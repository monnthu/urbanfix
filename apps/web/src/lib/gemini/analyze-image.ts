import {
  ReportCategory,
  ReportPriority,
  SLUG_TO_CATEGORY,
  SLUG_TO_PRIORITY,
} from "@/lib/constants";
import { generateContent } from "@/lib/gemini/client";
import type { ImageAnalysisResult } from "@/lib/types";

const CATEGORY_SLUGS = Object.keys(SLUG_TO_CATEGORY).filter(
  (slug) => !["inundacion", "inundación", "bache", "alumbrado", "basura", "otro", "baja", "media", "alta", "critica", "crítica"].includes(slug)
);

const ANALYSIS_PROMPT = `Analiza fotos de problemas urbanos para una plataforma cívica.

Devuelve SOLO JSON válido con esta forma:
{
  "category": "flooding|pothole|streetlight|garbage|graffiti|other",
  "priority": "low|medium|high|critical",
  "confidence": 0.0,
  "reason": "explicación breve en español"
}

Reglas:
- category debe ser una de: ${CATEGORY_SLUGS.join(", ")}
- priority debe ser una de: low, medium, high, critical
- confidence es un número entre 0 y 1
- riesgos de seguridad deben ser high o critical`;

function parseAnalysis(raw: string): ImageAnalysisResult {
  const parsed = JSON.parse(raw) as {
    category?: string;
    priority?: string;
    confidence?: number;
    reason?: string;
  };

  const categorySlug = parsed.category?.toLowerCase().trim() ?? "other";
  const prioritySlug = parsed.priority?.toLowerCase().trim() ?? "medium";

  const category = SLUG_TO_CATEGORY[categorySlug] ?? ReportCategory.Other;
  const priority = SLUG_TO_PRIORITY[prioritySlug] ?? ReportPriority.Medium;

  return {
    category,
    categorySlug,
    priority,
    prioritySlug,
    confidence:
      typeof parsed.confidence === "number"
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0.5,
    reason: parsed.reason?.slice(0, 280) || "Análisis de IA completado.",
  };
}

export async function analyzeReportImage(
  imageUrl: string,
  description?: string
): Promise<ImageAnalysisResult> {
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error("No se pudo obtener la imagen para análisis");
  }

  const contentType =
    imageResponse.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  const base64 = buffer.toString("base64");

  const prompt = description
    ? `${ANALYSIS_PROMPT}\n\nDescripción del reporte: ${description}`
    : ANALYSIS_PROMPT;

  const raw = await generateContent({
    text: prompt,
    imageBase64: base64,
    imageMimeType: contentType.split(";")[0],
    jsonMode: true,
  });

  return parseAnalysis(raw);
}
