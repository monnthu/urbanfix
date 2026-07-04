import {
  PRIORITY_LEVELS,
  REPORT_CATEGORIES,
  type PriorityLevel,
  type ReportCategory,
} from "@/lib/constants";
import { generateContent } from "@/lib/gemini/client";
import type { ImageAnalysisResult } from "@/lib/types";

const ANALYSIS_PROMPT = `You analyze photos of urban infrastructure problems for a civic reporting platform.

Return ONLY valid JSON with this exact shape:
{
  "category": "pothole|streetlight|garbage|water_leak|flooding|other",
  "priority": "low|medium|high|critical",
  "confidence": 0.0,
  "reason": "short explanation"
}

Rules:
- category must be one of: ${REPORT_CATEGORIES.join(", ")}
- priority must be one of: ${PRIORITY_LEVELS.join(", ")}
- confidence is a number from 0 to 1
- safety hazards (flooding, major leaks, dangerous road damage) should be high or critical priority`;

function parseAnalysis(raw: string): ImageAnalysisResult {
  const parsed = JSON.parse(raw) as Partial<ImageAnalysisResult>;

  if (
    !parsed.category ||
    !REPORT_CATEGORIES.includes(parsed.category as ReportCategory)
  ) {
    throw new Error("Invalid category from AI");
  }

  if (
    !parsed.priority ||
    !PRIORITY_LEVELS.includes(parsed.priority as PriorityLevel)
  ) {
    throw new Error("Invalid priority from AI");
  }

  return {
    category: parsed.category as ReportCategory,
    priority: parsed.priority as PriorityLevel,
    confidence:
      typeof parsed.confidence === "number"
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0.5,
    reason: parsed.reason?.slice(0, 280) || "AI analysis completed.",
  };
}

export async function analyzeReportImage(
  imageUrl: string,
  description?: string
): Promise<ImageAnalysisResult> {
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error("Could not fetch image for analysis");
  }

  const contentType =
    imageResponse.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  const base64 = buffer.toString("base64");

  const prompt = description
    ? `${ANALYSIS_PROMPT}\n\nReporter description: ${description}`
    : ANALYSIS_PROMPT;

  const raw = await generateContent({
    text: prompt,
    imageBase64: base64,
    imageMimeType: contentType.split(";")[0],
    jsonMode: true,
  });

  return parseAnalysis(raw);
}
