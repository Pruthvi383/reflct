import type { AuditInput, AuditResult, Finding, ToolEntry } from "@/types/audit";

import { pricingData } from "./pricing-data";

type PlanPrice = {
  pricePerSeat?: number;
};

type ToolPrice = {
  plans: Record<string, PlanPrice>;
};

function getPlanPrice(entry: ToolEntry): number {
  const tools = pricingData as Record<string, ToolPrice>;
  const tool = tools[entry.toolId];

  if (!tool) {
    return 0;
  }

  return tool.plans[entry.plan]?.pricePerSeat ?? 0;
}

function findClaudeTeamMinimum(entry: ToolEntry): Finding | null {
  if (entry.toolId !== "claude" || entry.plan !== "team" || entry.seats >= 5) {
    return null;
  }

  const minimumSeats = 5;
  const pricePerSeat = getPlanPrice(entry);
  const unusedSeats = minimumSeats - entry.seats;

  return {
    ruleId: "plan-mismatch",
    severity: "high",
    toolId: entry.toolId,
    message: `Claude Team has a ${minimumSeats}-seat minimum, so ${unusedSeats} paid seats are not being used.`,
    monthlySavings: unusedSeats * pricePerSeat
  };
}

function findSeatExcess(entry: ToolEntry, teamSize: number): Finding | null {
  const allowedSeats = teamSize * 1.1;
  // The first version of this was seats - teamSize; the 10% buffer avoids
  // flagging normal onboarding lag and keeps savings from going negative.
  const excessSeats = Math.max(0, entry.seats - allowedSeats);

  if (excessSeats <= 0) {
    return null;
  }

  const pricePerSeat = getPlanPrice(entry);
  const excessRatio = excessSeats / teamSize;

  return {
    ruleId: "seat-excess",
    severity: excessRatio >= 0.2 ? "high" : "medium",
    toolId: entry.toolId,
    message: `${entry.seats} seats is more than a 10% buffer for a ${teamSize}-person team.`,
    monthlySavings: Math.round(excessSeats * pricePerSeat)
  };
}

export function runAudit(input: AuditInput): AuditResult {
  const findings = input.tools.flatMap((entry) =>
    [findClaudeTeamMinimum(entry), findSeatExcess(entry, input.teamSize)].filter(
      (finding): finding is Finding => finding !== null
    )
  );

  const totalMonthlySavings = findings.reduce(
    (total, finding) => total + finding.monthlySavings,
    0
  );

  return {
    findings,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    auditedAt: new Date().toISOString()
  };
}
