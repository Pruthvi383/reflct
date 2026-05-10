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

export interface AuditResult {
  // Filling this in once the engine has real output.
}
