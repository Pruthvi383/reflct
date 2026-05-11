import type { Metadata } from "next";

import { ResultsClient } from "@/components/results-client";
import { getAuditResult } from "@/lib/audit-store";
import { formatDollars } from "@/lib/utils";

export async function generateMetadata({
  params
}: {
  params: Promise<{ auditId: string }>;
}): Promise<Metadata> {
  const { auditId } = await params;
  const result = await getAuditResult(auditId);
  const topFinding = result?.findings[0]?.message ?? "AI tool spend audit results";
  const savings = result?.totalMonthlySavings ?? 0;

  return {
    title: `SpendLens Audit - Save ${formatDollars(savings)}/month`,
    description: topFinding,
    openGraph: {
      title: `SpendLens Audit - Save ${formatDollars(savings)}/month`,
      description: topFinding,
      images: ["/og-spendlens.svg"],
      type: "website"
    }
  };
}

export default async function ResultsPage({
  params
}: {
  params: Promise<{ auditId: string }>;
}) {
  const { auditId } = await params;
  const result = await getAuditResult(auditId);

  return <ResultsClient auditId={auditId} initialResult={result} />;
}
