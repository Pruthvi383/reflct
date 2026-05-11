"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { formatDollars } from "@/lib/utils";
import { getToolName } from "@/lib/pricing-data";
import type { AuditResult, Finding } from "@/types/audit";

const severityClass: Record<Finding["severity"], string> = {
  high: "border-red-200 bg-red-50 text-red-800",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
  low: "border-blue-200 bg-blue-50 text-blue-800"
};

export function ResultsClient({
  auditId,
  initialResult
}: {
  auditId: string;
  initialResult: AuditResult | null;
}) {
  const [result, setResult] = useState<AuditResult | null>(() => {
    if (initialResult || typeof window === "undefined") {
      return initialResult;
    }

    const saved = window.localStorage.getItem(`spendlens:audit:${auditId}`);
    return saved ? (JSON.parse(saved) as AuditResult) : null;
  });
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [leadStatus, setLeadStatus] = useState("");

  useEffect(() => {
    if (result) {
      window.localStorage.setItem(`spendlens:audit:${auditId}`, JSON.stringify(result));
      return;
    }

    fetch(`/api/audit/${auditId}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.result) {
          setResult(data.result as AuditResult);
        }
      });
  }, [auditId, result]);

  useEffect(() => {
    if (!result) {
      return;
    }

    fetch("/api/summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        auditId,
        findings: result.findings,
        totalSavings: result.totalMonthlySavings,
        teamSize: result.teamSize
      })
    })
      .then((response) => response.json())
      .then((data) => setSummary(data.summary ?? "Summary unavailable."))
      .finally(() => setSummaryLoading(false));
  }, [auditId, result]);

  const groupedFindings = useMemo(() => {
    const map = new Map<string, Finding[]>();

    for (const finding of result?.findings ?? []) {
      map.set(finding.toolId, [...(map.get(finding.toolId) ?? []), finding]);
    }

    return map;
  }, [result]);

  if (!result) {
    return (
      <main className="min-h-screen px-6 py-10 text-ink">
        <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Loading audit...</p>
        </div>
      </main>
    );
  }

  const shareText = `SpendLens found ${formatDollars(result.totalMonthlySavings)}/month in AI tool savings.`;

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, auditId })
    });

    setLeadStatus(response.ok ? "Saved. Check your email for the audit link." : "Could not save lead.");
    if (response.ok) {
      event.currentTarget.reset();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-ink">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <Link className="text-sm font-semibold uppercase tracking-[0.24em] text-lens" href="/">
            SpendLens
          </Link>
          <p className="text-xs text-slate-500">Audit {auditId.slice(0, 8)}</p>
        </header>

        <section className="rounded-lg bg-ink p-8 text-white shadow-sm">
          <p className="text-sm font-semibold text-blue-200">Estimated savings</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            {result.totalMonthlySavings > 0
              ? `${formatDollars(result.totalMonthlySavings)}/month`
              : "Your AI stack looks optimized"}
          </h1>
          <p className="mt-4 text-lg text-slate-200">
            {formatDollars(result.totalAnnualSavings)} annualized savings across{" "}
            {result.findings.length} finding{result.findings.length === 1 ? "" : "s"}.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Per-tool breakdown</h2>
          <div className="mt-4 grid gap-4">
            {result.tools.map((tool, index) => {
              const findings = groupedFindings.get(tool.toolId) ?? [];
              const topSeverity = findings[0]?.severity;

              return (
                <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={`${tool.toolId}-${index}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{getToolName(tool.toolId)}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {tool.plan} plan, {tool.seats} seats, {formatDollars(tool.monthlySpend)}/month
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                        topSeverity ? severityClass[topSeverity] : "border-emerald-200 bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {topSeverity ?? "none"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {findings.length ? (
                      findings.map((finding) => (
                        <div className="rounded-md bg-slate-50 p-3" key={`${finding.ruleId}-${finding.message}`}>
                          <p className="text-sm font-medium">{finding.message}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Estimated savings: {formatDollars(finding.monthlySavings)}/month
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No obvious configuration issues for this tool.</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-semibold">AI summary</h2>
          {summaryLoading ? (
            <div className="mt-4 space-y-3">
              <div className="h-4 w-11/12 rounded bg-slate-200" />
              <div className="h-4 w-10/12 rounded bg-slate-200" />
              <div className="h-4 w-8/12 rounded bg-slate-200" />
            </div>
          ) : (
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
              {summary.split("\n").filter(Boolean).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-semibold">Send this audit</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Capture the email and send a confirmation link. In demo mode this saves locally only.
            </p>
          </div>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={submitLead}>
            <input className="hidden" name="website" tabIndex={-1} />
            <input className="h-10 rounded-md border border-slate-300 px-3 text-sm" name="email" placeholder="Email" required type="email" />
            <input className="h-10 rounded-md border border-slate-300 px-3 text-sm" name="name" placeholder="Name" />
            <input className="h-10 rounded-md border border-slate-300 px-3 text-sm sm:col-span-2" name="company" placeholder="Company" />
            <button className="h-10 rounded-md bg-lens px-4 text-sm font-semibold text-white sm:col-span-2" type="submit">
              Send audit link
            </button>
            {leadStatus ? <p className="text-sm text-slate-600 sm:col-span-2">{leadStatus}</p> : null}
          </form>
        </section>

        <section className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
          <button
            aria-label="Copy results link"
            className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold"
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              setCopied(true);
            }}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a
            aria-label="Share results on X"
            className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(typeof window === "undefined" ? "" : window.location.href)}`}
            rel="noreferrer"
            target="_blank"
          >
            Share on X
          </a>
          <a
            aria-label="Share results on LinkedIn"
            className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window === "undefined" ? "" : window.location.href)}`}
            rel="noreferrer"
            target="_blank"
          >
            Share on LinkedIn
          </a>
        </section>
      </div>
    </main>
  );
}
