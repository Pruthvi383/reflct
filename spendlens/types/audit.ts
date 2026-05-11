export interface ToolEntry {
  toolId: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  teamSize: number;
  tools: ToolEntry[];
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
}
