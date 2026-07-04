export class GeminiError extends Error {
  code: "missing_key" | "quota_exceeded" | "invalid_response" | "request_failed";

  constructor(
    message: string,
    code: GeminiError["code"]
  ) {
    super(message);
    this.name = "GeminiError";
    this.code = code;
  }
}

const GEMINI_MODEL = "gemini-2.0-flash";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiError(
      "GEMINI_API_KEY is not configured. Add it to .env.local.",
      "missing_key"
    );
  }
  return key;
}

type GenerateContentInput = {
  text: string;
  imageBase64?: string;
  imageMimeType?: string;
  jsonMode?: boolean;
};

export async function generateContent({
  text,
  imageBase64,
  imageMimeType,
  jsonMode = false,
}: GenerateContentInput): Promise<string> {
  const apiKey = getApiKey();

  const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> =
    [{ text }];

  if (imageBase64 && imageMimeType) {
    parts.push({
      inline_data: {
        mime_type: imageMimeType,
        data: imageBase64,
      },
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: jsonMode
          ? { responseMimeType: "application/json" }
          : undefined,
      }),
    }
  );

  if (response.status === 429) {
    throw new GeminiError(
      "Gemini quota exceeded. Try again later or check your API limits.",
      "quota_exceeded"
    );
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new GeminiError(
      `Gemini request failed (${response.status}): ${detail.slice(0, 200)}`,
      "request_failed"
    );
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const textResult = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!textResult) {
    throw new GeminiError("Gemini returned an empty response.", "invalid_response");
  }

  return textResult;
}

export function geminiErrorResponse(error: unknown) {
  if (error instanceof GeminiError) {
    const status =
      error.code === "quota_exceeded"
        ? 429
        : error.code === "missing_key"
          ? 503
          : 502;

    return {
      status,
      body: {
        error: error.message,
        code: error.code,
      },
    };
  }

  return {
    status: 500,
    body: {
      error: "Unexpected AI error",
      code: "request_failed",
    },
  };
}
