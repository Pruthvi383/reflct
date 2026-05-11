import type { AuditResult } from "@/types/audit";

type AuditRecord = {
  id: string;
  result: AuditResult;
};

const memoryStore = globalThis as typeof globalThis & {
  __spendlensAudits?: Map<string, AuditRecord>;
};

function getMemoryStore() {
  if (!memoryStore.__spendlensAudits) {
    memoryStore.__spendlensAudits = new Map();
  }

  return memoryStore.__spendlensAudits;
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return { url, serviceKey };
}

export async function saveAuditResult(id: string, result: AuditResult) {
  getMemoryStore().set(id, { id, result });

  const config = getSupabaseConfig();

  if (!config) {
    return;
  }

  const response = await fetch(`${config.url}/rest/v1/audits`, {
    method: "POST",
    headers: {
      apikey: config.serviceKey,
      authorization: `Bearer ${config.serviceKey}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify({
      id,
      team_size: result.teamSize,
      tools: result.tools,
      findings: result.findings,
      total_monthly_savings: result.totalMonthlySavings,
      total_annual_savings: result.totalAnnualSavings
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase audit insert failed: ${body}`);
  }
}

export async function getAuditResult(id: string): Promise<AuditResult | null> {
  const memoryRecord = getMemoryStore().get(id);

  if (memoryRecord) {
    return memoryRecord.result;
  }

  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/rest/v1/audits?id=eq.${id}&select=*`, {
    headers: {
      apikey: config.serviceKey,
      authorization: `Bearer ${config.serviceKey}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as Array<{
    team_size: number;
    tools: AuditResult["tools"];
    findings: AuditResult["findings"];
    total_monthly_savings: number;
    total_annual_savings: number;
    created_at?: string;
  }>;

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    teamSize: row.team_size,
    tools: row.tools,
    findings: row.findings,
    totalMonthlySavings: Number(row.total_monthly_savings),
    totalAnnualSavings: Number(row.total_annual_savings),
    auditedAt: row.created_at ?? new Date().toISOString()
  };
}

export async function saveLead(input: {
  auditId: string;
  email: string;
  name?: string;
  company?: string;
  ipHash?: string;
}) {
  const config = getSupabaseConfig();

  if (!config) {
    return;
  }

  const response = await fetch(`${config.url}/rest/v1/leads`, {
    method: "POST",
    headers: {
      apikey: config.serviceKey,
      authorization: `Bearer ${config.serviceKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      audit_id: input.auditId,
      email: input.email,
      name: input.name,
      company: input.company,
      ip_hash: input.ipHash
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase lead insert failed: ${body}`);
  }
}
