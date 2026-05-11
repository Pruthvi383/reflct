import { NextResponse } from "next/server";

import { runAudit } from "@/lib/audit-engine";
import { saveAuditResult } from "@/lib/audit-store";
import { auditInputSchema } from "@/lib/form-schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = auditInputSchema.safeParse(body.input ?? body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid audit input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const auditId = crypto.randomUUID();
    const result = runAudit(parsed.data);

    try {
      await saveAuditResult(auditId, result);
    } catch (error) {
      console.error("[/api/audit] store failed", error);
    }

    return NextResponse.json({ auditId, result });
  } catch (error) {
    console.error("[/api/audit]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
