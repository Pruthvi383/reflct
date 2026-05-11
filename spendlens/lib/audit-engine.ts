import type { AuditInput, AuditResult, Finding, ToolEntry } from "@/types/audit";

import { getToolName, pricingData } from "./pricing-data";

type PlanPrice = {
  pricePerSeat?: number;
};

type ToolPrice = {
  name: string;
  category: string;
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

function getTool(entry: ToolEntry): ToolPrice | undefined {
  return (pricingData as Record<string, ToolPrice>)[entry.toolId];
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

function findApiSpendMismatch(entry: ToolEntry): Finding | null {
  const isSeatPlan = getPlanPrice(entry) > 0;

  if (entry.useCase !== "api" || !isSeatPlan) {
    return null;
  }

  return {
    ruleId: "api-spend",
    severity: "medium",
    toolId: entry.toolId,
    message: `${getToolName(entry.toolId)} is marked as API/integration usage but is still on a seat-based plan.`,
    monthlySavings: Math.round(entry.monthlySpend * 0.3)
  };
}

function findAnnualBillingOpportunity(entry: ToolEntry): Finding | null {
  if (entry.monthlySpend <= 100 || entry.billingCycle === "annual") {
    return null;
  }

  return {
    ruleId: "annual-billing",
    severity: "low",
    toolId: entry.toolId,
    message: `${getToolName(entry.toolId)} is over $100/month on monthly billing; annual billing usually saves around 17%.`,
    monthlySavings: Math.round(entry.monthlySpend * 0.17)
  };
}

function findUseCaseMismatch(entries: ToolEntry[]): Finding[] {
  const cursor = entries.find((entry) => entry.toolId === "cursor");
  const copilot = entries.find((entry) => entry.toolId === "githubCopilot");

  if (!cursor || !copilot) {
    return [];
  }

  const cheaper = cursor.monthlySpend <= copilot.monthlySpend ? cursor : copilot;

  return [
    {
      ruleId: "use-case-mismatch",
      severity: "medium",
      toolId: cheaper.toolId,
      message: "Cursor and GitHub Copilot overlap heavily for coding assistance. Pick the one the team actually uses.",
      monthlySavings: cheaper.monthlySpend
    }
  ];
}

function findCreditOpportunity(input: AuditInput): Finding[] {
  if (input.startupCreditsUsed) {
    return [];
  }

  const creditTool = input.tools.find((entry) =>
    ["claude", "chatgpt", "gemini"].includes(entry.toolId)
  );

  if (!creditTool) {
    return [];
  }

  return [
    {
      ruleId: "credit-opportunity",
      severity: "low",
      toolId: creditTool.toolId,
      message: "You may qualify for startup credits from Anthropic, OpenAI, or Google. Check credits before cutting seats.",
      monthlySavings: 0
    }
  ];
}

function findRedundancy(entries: ToolEntry[]): Finding[] {
  const byCategory = new Map<string, ToolEntry[]>();

  for (const entry of entries) {
    const category = getTool(entry)?.category;

    if (!category || category === "code") {
      continue;
    }

    byCategory.set(category, [...(byCategory.get(category) ?? []), entry]);
  }

  return Array.from(byCategory.entries()).flatMap(([category, categoryEntries]) => {
    if (categoryEntries.length < 2) {
      return [];
    }

    const redundant = [...categoryEntries].sort((a, b) => a.monthlySpend - b.monthlySpend)[0];

    return [
      {
        ruleId: "redundancy",
        severity: "medium",
        toolId: redundant.toolId,
        message: `${categoryEntries.map((entry) => getToolName(entry.toolId)).join(" + ")} all cover ${category} workflows. Remove the least-used one first.`,
        monthlySavings: redundant.monthlySpend
      } satisfies Finding
    ];
  });
}

export function runAudit(input: AuditInput): AuditResult {
  const perToolFindings = input.tools.flatMap((entry) =>
    [
      findClaudeTeamMinimum(entry),
      findSeatExcess(entry, input.teamSize),
      findApiSpendMismatch(entry),
      findAnnualBillingOpportunity(entry)
    ].filter(
      (finding): finding is Finding => finding !== null
    )
  );

  const findings = [
    ...perToolFindings,
    ...findUseCaseMismatch(input.tools),
    ...findCreditOpportunity(input),
    ...findRedundancy(input.tools)
  ];

  const totalMonthlySavings = findings.reduce(
    (total, finding) => total + finding.monthlySavings,
    0
  );

  return {
    findings,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    auditedAt: new Date().toISOString(),
    tools: input.tools,
    teamSize: input.teamSize
  };
}
