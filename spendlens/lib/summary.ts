import type { Finding } from "@/types/audit";

export function createFallbackSummary(input: {
  findings: Finding[];
  totalSavings: number;
  teamSize: number;
}) {
  const topFinding = input.findings[0];
  const lowerBenchmark = input.teamSize * 25;
  const upperBenchmark = input.teamSize * 50;

  if (!topFinding) {
    return `Your AI stack looks reasonably tight based on the inputs provided. The audit did not find obvious seat waste, redundant subscriptions, or plan mismatches, so your estimated savings is $0/month.\n\nYour best action this week is to verify invoices against actual users. Even optimized teams can drift when contractors leave or a pilot tool quietly becomes permanent.\n\nTeams around ${input.teamSize} people typically spend about $${lowerBenchmark}-$${upperBenchmark}/month on core AI tooling, depending on how many people need coding assistants versus shared research tools.`;
  }

  return `Based on your audit, your team could save approximately $${input.totalSavings}/month by addressing ${input.findings.length} configuration issues in your AI tool stack.\n\nYour most impactful action this week: ${topFinding.message}\n\nTeams your size typically spend $${lowerBenchmark}-$${upperBenchmark}/month on AI tooling. Review your findings below for the specific subscriptions, seat counts, and billing settings to clean up first.`;
}
