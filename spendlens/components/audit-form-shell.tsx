"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { pricingData } from "@/lib/pricing-data";
import type { AuditInput, ToolEntry } from "@/types/audit";

const storageKey = "spendlens:audit-form";

const defaultTool: ToolEntry = {
  toolId: "cursor",
  plan: "pro",
  seats: 5,
  monthlySpend: 100,
  useCase: "individual",
  billingCycle: "monthly"
};

const defaultInput: AuditInput = {
  teamSize: 5,
  startupCreditsUsed: false,
  tools: [defaultTool]
};

function firstPlanFor(toolId: string) {
  return Object.keys(pricingData[toolId as keyof typeof pricingData]?.plans ?? {})[0] ?? "";
}

export function AuditFormShell() {
  const router = useRouter();
  const [input, setInput] = useState<AuditInput>(() => {
    if (typeof window === "undefined") {
      return defaultInput;
    }

    const saved = window.localStorage.getItem(storageKey);

    if (!saved) {
      return defaultInput;
    }

    try {
      return JSON.parse(saved) as AuditInput;
    } catch {
      window.localStorage.removeItem(storageKey);
      return defaultInput;
    }
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingFocusIndex = useRef<number | null>(null);
  const selectRefs = useRef<Array<HTMLSelectElement | null>>([]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(input));
  }, [input]);

  useEffect(() => {
    if (pendingFocusIndex.current === null) {
      return;
    }

    selectRefs.current[pendingFocusIndex.current]?.focus();
    pendingFocusIndex.current = null;
  }, [input.tools.length]);

  const toolOptions = useMemo(() => Object.entries(pricingData), []);

  function updateTool(index: number, patch: Partial<ToolEntry>) {
    setInput((current) => ({
      ...current,
      tools: current.tools.map((tool, toolIndex) =>
        toolIndex === index ? { ...tool, ...patch } : tool
      )
    }));
  }

  function addTool() {
    setInput((current) => ({
      ...current,
      tools: [...current.tools, { ...defaultTool }]
    }));
    pendingFocusIndex.current = input.tools.length;
  }

  function removeTool(index: number) {
    setInput((current) => ({
      ...current,
      tools: current.tools.filter((_, toolIndex) => toolIndex !== index)
    }));
  }

  function resetForm() {
    window.localStorage.removeItem(storageKey);
    setInput(defaultInput);
  }

  async function submitAudit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input })
      });
      const data = (await response.json()) as {
        auditId?: string;
        result?: unknown;
        error?: string;
      };

      if (!response.ok || !data.auditId || !data.result) {
        throw new Error(data.error ?? "Audit failed");
      }

      window.localStorage.setItem(
        `spendlens:audit:${data.auditId}`,
        JSON.stringify(data.result)
      );
      router.push(`/results/${data.auditId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Audit failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submitAudit}>
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Audit setup</h2>
          <p className="mt-1 text-sm text-slate-500">
            Start with the tools your team pays for monthly.
          </p>
        </div>
        <label className="w-28 text-sm font-medium text-slate-700">
          Team size
          <input
            className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-lens/20 transition focus:border-lens focus:ring-4"
            inputMode="numeric"
            min={1}
            type="number"
            value={input.teamSize}
            onChange={(event) =>
              setInput((current) => ({ ...current, teamSize: Number(event.target.value) }))
            }
          />
        </label>
      </div>

      <div className="space-y-4">
        {input.tools.map((row, index) => {
          const tool = pricingData[row.toolId as keyof typeof pricingData];
          const plans = Object.entries(tool?.plans ?? {});

          return (
            <fieldset
              className="grid gap-3 rounded-md border border-slate-200 bg-mist p-4 sm:grid-cols-[1.1fr_1fr_0.7fr_0.9fr]"
              key={`${row.toolId}-${index}`}
            >
              <legend className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Tool {index + 1}
              </legend>

              <label className="text-sm font-medium text-slate-700">
                Tool
                <select
                  ref={(node) => {
                    selectRefs.current[index] = node;
                  }}
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-lens/20 transition focus:border-lens focus:ring-4"
                  value={row.toolId}
                  onChange={(event) => {
                    const toolId = event.target.value;
                    updateTool(index, { toolId, plan: firstPlanFor(toolId) });
                  }}
                >
                  {toolOptions.map(([id, option]) => (
                    <option key={id} value={id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Plan
                <select
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-lens/20 transition focus:border-lens focus:ring-4"
                  value={row.plan}
                  onChange={(event) => updateTool(index, { plan: event.target.value })}
                >
                  {plans.map(([id, plan]) => (
                    <option key={id} value={id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Seats
                <input
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-lens/20 transition focus:border-lens focus:ring-4"
                  inputMode="numeric"
                  min={1}
                  type="number"
                  value={row.seats}
                  onChange={(event) => updateTool(index, { seats: Number(event.target.value) })}
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Monthly spend
                <input
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-lens/20 transition focus:border-lens focus:ring-4"
                  inputMode="decimal"
                  min={0}
                  type="number"
                  value={row.monthlySpend}
                  onChange={(event) =>
                    updateTool(index, { monthlySpend: Number(event.target.value) })
                  }
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Use case
                <select
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-lens/20 transition focus:border-lens focus:ring-4"
                  value={row.useCase ?? "individual"}
                  onChange={(event) =>
                    updateTool(index, { useCase: event.target.value as ToolEntry["useCase"] })
                  }
                >
                  <option value="individual">Individual</option>
                  <option value="api">API/integration</option>
                  <option value="mixed">Mixed</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Billing
                <select
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-lens/20 transition focus:border-lens focus:ring-4"
                  value={row.billingCycle ?? "monthly"}
                  onChange={(event) =>
                    updateTool(index, {
                      billingCycle: event.target.value as ToolEntry["billingCycle"]
                    })
                  }
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </label>

              <div className="flex items-end">
                <button
                  className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-40"
                  disabled={input.tools.length === 1}
                  type="button"
                  onClick={() => removeTool(index)}
                >
                  Remove
                </button>
              </div>
            </fieldset>
          );
        })}
      </div>

      <label className="flex items-start gap-3 rounded-md bg-blue-50 p-3 text-sm text-slate-700">
        <input
          className="mt-1"
          type="checkbox"
          checked={input.startupCreditsUsed ?? false}
          onChange={(event) =>
            setInput((current) => ({ ...current, startupCreditsUsed: event.target.checked }))
          }
        />
        <span>We already use startup credits for OpenAI, Anthropic, or Google.</span>
      </label>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <button
            className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            type="button"
            onClick={addTool}
          >
            Add tool
          </button>
          <button
            className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            type="button"
            onClick={resetForm}
          >
            Start over
          </button>
        </div>
        <button
          className="h-10 rounded-md bg-lens px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Auditing..." : "Run audit"}
        </button>
      </div>
    </form>
  );
}
