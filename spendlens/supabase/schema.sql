create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  team_size integer not null,
  tools jsonb not null,
  findings jsonb not null,
  total_monthly_savings numeric not null,
  total_annual_savings numeric not null,
  summary text
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  audit_id uuid references audits(id),
  email text not null,
  name text,
  company text,
  ip_hash text
);

alter table audits enable row level security;
alter table leads enable row level security;

drop policy if exists "Public audits are readable by id" on audits;
create policy "Public audits are readable by id"
  on audits for select
  using (true);
