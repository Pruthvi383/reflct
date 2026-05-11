import { NextResponse } from "next/server";

import { getAuditResult } from "@/lib/audit-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ auditId: string }> }
) {
  const { auditId } = await params;
  const result = await getAuditResult(auditId);

  if (!result) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json({ auditId, result });
}
