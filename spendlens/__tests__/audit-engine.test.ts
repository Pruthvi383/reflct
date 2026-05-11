import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { runAudit } from "../lib/audit-engine";

describe("runAudit", () => {
  it("flags Claude Team when seats < 5", () => {
    const result = runAudit({
      teamSize: 8,
      tools: [
        {
          toolId: "claude",
          plan: "team",
          monthlySpend: 50,
          seats: 2
        }
      ]
    });

    assert.equal(result.findings.length, 1);
    assert.equal(result.findings[0]?.ruleId, "plan-mismatch");
    assert.equal(result.findings[0]?.severity, "high");
    assert.equal(result.findings[0]?.monthlySavings, 75);
    assert.equal(result.totalMonthlySavings, 75);
  });

  it("flags excess seats when team has > 10% buffer", () => {
    const result = runAudit({
      teamSize: 10,
      tools: [
        {
          toolId: "cursor",
          plan: "pro",
          monthlySpend: 260,
          seats: 13
        }
      ]
    });

    assert.equal(result.findings.length, 1);
    assert.equal(result.findings[0]?.ruleId, "seat-excess");
    assert.equal(result.findings[0]?.monthlySavings, 40);
    assert.equal(result.totalAnnualSavings, 480);
  });

  it("has no findings when tool is correctly configured", () => {
    const result = runAudit({
      teamSize: 10,
      tools: [
        {
          toolId: "githubCopilot",
          plan: "business",
          monthlySpend: 190,
          seats: 10
        }
      ]
    });

    assert.deepEqual(result.findings, []);
    assert.equal(result.totalMonthlySavings, 0);
    assert.equal(result.totalAnnualSavings, 0);
  });
});
