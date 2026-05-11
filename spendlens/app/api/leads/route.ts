import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { saveLead } from "@/lib/audit-store";
import { leadSchema } from "@/lib/form-schema";

const rateLimit = globalThis as typeof globalThis & {
  __spendlensLeadRateLimit?: Map<string, { count: number; resetAt: number }>;
};

function getRateMap() {
  if (!rateLimit.__spendlensLeadRateLimit) {
    rateLimit.__spendlensLeadRateLimit = new Map();
  }

  return rateLimit.__spendlensLeadRateLimit;
}

function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

async function sendConfirmationEmail(input: {
  email: string;
  auditId: string;
  totalSavings?: number;
  origin: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "SpendLens <onboarding@resend.dev>",
      to: input.email,
      subject: "Your SpendLens audit is ready",
      text: `Your SpendLens audit is ready.\n\nEstimated savings: $${input.totalSavings ?? 0}/month\nResults: ${input.origin}/results/${input.auditId}`
    })
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lead input" }, { status: 400 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const ipHash = hashIp(ip);
  const now = Date.now();
  const map = getRateMap();
  const current = map.get(ipHash) ?? { count: 0, resetAt: now + 60 * 60 * 1000 };

  if (current.resetAt < now) {
    map.set(ipHash, { count: 1, resetAt: now + 60 * 60 * 1000 });
  } else if (current.count >= 3) {
    return NextResponse.json({ error: "Too many submissions" }, { status: 429 });
  } else {
    map.set(ipHash, { count: current.count + 1, resetAt: current.resetAt });
  }

  try {
    await saveLead({ ...parsed.data, ipHash });
    await sendConfirmationEmail({
      email: parsed.data.email,
      auditId: parsed.data.auditId,
      origin: new URL(request.url).origin
    });
  } catch (error) {
    console.error("[/api/leads]", error);
  }

  return NextResponse.json({ ok: true });
}
