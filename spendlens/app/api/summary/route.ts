import { NextResponse } from "next/server";

import { createFallbackSummary } from "@/lib/summary";
import type { Finding } from "@/types/audit";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    auditId?: string;
    findings?: Finding[];
    totalSavings?: number;
    teamSize?: number;
  };

  const findings = body.findings ?? [];
  const totalSavings = body.totalSavings ?? 0;
  const teamSize = body.teamSize ?? 1;
  const fallback = createFallbackSummary({ findings, totalSavings, teamSize });
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ summary: fallback, source: "fallback" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: `Write a 3-paragraph plain-English SpendLens audit summary.

Paragraph 1: what the audit found, with numbers and tool names.
Paragraph 2: the single highest-priority action to take this week.
Paragraph 3: what an optimized stack looks like for a team of ${teamSize}.

Total monthly savings: $${totalSavings}
Findings: ${JSON.stringify(findings)}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const summary = data.content?.find((item) => item.type === "text")?.text;

    return NextResponse.json({ summary: summary ?? fallback, source: "anthropic" });
  } catch (error) {
    console.error("[/api/summary]", error);
    return NextResponse.json({ summary: fallback, source: "fallback" });
  } finally {
    clearTimeout(timeout);
  }
}
