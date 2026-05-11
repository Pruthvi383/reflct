export interface ToolEntry {
  toolId: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  useCase?: "individual" | "api" | "mixed";
  billingCycle?: "monthly" | "annual";
}

export interface AuditInput {
  teamSize: number;
  tools: ToolEntry[];
  startupCreditsUsed?: boolean;
}

export interface Finding {
  ruleId: string;
  severity: "high" | "medium" | "low";
  toolId: string;
  message: string;
  monthlySavings: number;
}

export interface AuditResult {
  findings: Finding[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  auditedAt: string;
  tools: ToolEntry[];
  teamSize: number;
}
