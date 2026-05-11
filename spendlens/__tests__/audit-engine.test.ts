import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { runAudit } from "../lib/audit-engine";

describe("runAudit", () => {
  it("flags Claude Team when seats < 5", () => {
    const result = runAudit({
      teamSize: 8,
      startupCreditsUsed: true,
      tools: [
        {
          toolId: "claude",
          plan: "team",
          monthlySpend: 50,
          seats: 2,
          billingCycle: "annual"
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
      startupCreditsUsed: true,
      tools: [
        {
          toolId: "cursor",
          plan: "pro",
          monthlySpend: 260,
          seats: 13,
          billingCycle: "annual"
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
      startupCreditsUsed: true,
      tools: [
        {
          toolId: "githubCopilot",
          plan: "business",
          monthlySpend: 190,
          seats: 10,
          billingCycle: "annual"
        }
      ]
    });

    assert.deepEqual(result.findings, []);
    assert.equal(result.totalMonthlySavings, 0);
    assert.equal(result.totalAnnualSavings, 0);
  });

  it("flags API usage on a seat plan", () => {
    const result = runAudit({
      teamSize: 12,
      startupCreditsUsed: true,
      tools: [
        {
          toolId: "chatgpt",
          plan: "team",
          monthlySpend: 300,
          seats: 12,
          useCase: "api"
        }
      ]
    });

    assert.equal(result.findings[0]?.ruleId, "api-spend");
    assert.equal(result.findings[0]?.monthlySavings, 90);
  });

  it("flags monthly billing when spend is over 100", () => {
    const result = runAudit({
      teamSize: 6,
      startupCreditsUsed: true,
      tools: [
        {
          toolId: "windsurf",
          plan: "teams",
          monthlySpend: 210,
          seats: 6,
          billingCycle: "monthly"
        }
      ]
    });

    assert.equal(result.findings[0]?.ruleId, "annual-billing");
    assert.equal(result.findings[0]?.monthlySavings, 36);
  });

  it("flags Cursor and Copilot overlap", () => {
    const result = runAudit({
      teamSize: 6,
      startupCreditsUsed: true,
      tools: [
        { toolId: "cursor", plan: "pro", monthlySpend: 120, seats: 6 },
        { toolId: "githubCopilot", plan: "business", monthlySpend: 114, seats: 6 }
      ]
    });

    assert.equal(result.findings.find((finding) => finding.ruleId === "use-case-mismatch")?.monthlySavings, 114);
  });

  it("flags startup credit opportunity without estimating savings", () => {
    const result = runAudit({
      teamSize: 4,
      tools: [{ toolId: "claude", plan: "pro", monthlySpend: 80, seats: 4 }]
    });

    const finding = result.findings.find((item) => item.ruleId === "credit-opportunity");
    assert.equal(finding?.severity, "low");
    assert.equal(finding?.monthlySavings, 0);
  });

  it("flags assistant redundancy", () => {
    const result = runAudit({
      teamSize: 8,
      startupCreditsUsed: true,
      tools: [
        { toolId: "chatgpt", plan: "team", monthlySpend: 200, seats: 8 },
        { toolId: "claude", plan: "team", monthlySpend: 200, seats: 8 },
        { toolId: "gemini", plan: "business", monthlySpend: 160, seats: 8 }
      ]
    });

    const finding = result.findings.find((item) => item.ruleId === "redundancy");
    assert.equal(finding?.toolId, "gemini");
    assert.equal(finding?.monthlySavings, 160);
  });
});
