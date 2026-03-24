import { GoogleGenerativeAI } from "@google/generative-ai";

import type { WrappedSummary } from "@/types/database";

const wrappedSchemaGuard = (value: unknown): value is WrappedSummary => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.themes) &&
    typeof candidate.focusTrend === "string" &&
    typeof candidate.insight === "string" &&
    typeof candidate.bestWeek === "string" &&
    typeof candidate.goalsHit === "number" &&
    typeof candidate.totalGoals === "number"
  );
};

export async function generateWrappedSummary(prompt: string) {
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(text) as unknown;

  if (!wrappedSchemaGuard(parsed)) {
    throw new Error("Gemini returned an unexpected wrapped shape.");
  }

  return parsed;
}
