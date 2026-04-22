create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('subscriber', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_plan') then
    create type public.subscription_plan as enum ('monthly', 'yearly');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum (
      'trialing',
      'active',
      'past_due',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'unpaid',
      'paused'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'draw_logic_type') then
    create type public.draw_logic_type as enum ('random', 'algorithmic');
  end if;

  if not exists (select 1 from pg_type where typname = 'draw_status') then
    create type public.draw_status as enum ('draft', 'simulated', 'published');
  end if;

  if not exists (select 1 from pg_type where typname = 'match_type') then
    create type public.match_type as enum ('match_5', 'match_4', 'match_3');
  end if;

  if not exists (select 1 from pg_type where typname = 'winner_status') then
    create type public.winner_status as enum ('pending_verification', 'approved', 'rejected', 'paid');
  end if;

  if not exists (select 1 from pg_type where typname = 'donation_source') then
    create type public.donation_source as enum ('subscription', 'independent');
  end if;
end $$;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$ language sql stable security definer set search_path = public;

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'subscriber',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  plan public.subscription_plan not null,
  status public.subscription_status not null default 'incomplete',
  amount numeric(10,2) not null default 0,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  impact_blurb text,
  image_url text,
  event_blurb text,
  location text,
  website_url text,
  tags text[] default '{}',
  featured boolean default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_charity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  charity_id uuid not null references public.charities(id) on delete restrict,
  contribution_percentage numeric(5,2) not null default 10 check (contribution_percentage >= 10 and contribution_percentage <= 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  charity_id uuid not null references public.charities(id) on delete restrict,
  amount numeric(10,2) not null check (amount > 0),
  source public.donation_source not null default 'independent',
  payment_reference text,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  score integer not null check (score between 1 and 45),
  played_at date not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, played_at)
);

create index if not exists scores_user_id_played_at_idx on public.scores(user_id, played_at desc);

create or replace function public.trim_scores_limit()
returns trigger as $$
begin
  delete from public.scores
  where id in (
    select id
    from public.scores
    where user_id = new.user_id
    order by played_at desc, created_at desc
    offset 5
  );

  return new;
end;
$$ language plpgsql;

create table if not exists public.draws (
  id uuid primary key default gen_random_uuid(),
  draw_month date not null unique,
  status public.draw_status not null default 'draft',
  logic_type public.draw_logic_type not null default 'random',
  winning_numbers integer[] check (winning_numbers is null or cardinality(winning_numbers) = 5),
  active_subscriber_count integer not null default 0,
  pool_amount numeric(10,2) not null default 0,
  carryover_amount numeric(10,2) default 0,
  notes text,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.prize_pool_config (
  id uuid primary key default gen_random_uuid(),
  match_type public.match_type not null unique,
  percentage numeric(5,2) not null check (percentage > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.draw_results (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  match_type public.match_type not null,
  winner_user_ids uuid[] default '{}',
  winner_count integer not null default 0,
  pool_amount numeric(10,2) not null default 0,
  rollover boolean not null default false,
  rollover_amount numeric(10,2),
  created_at timestamptz not null default timezone('utc', now()),
  unique (draw_id, match_type)
);

create table if not exists public.winners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  draw_id uuid not null references public.draws(id) on delete cascade,
  match_type public.match_type not null,
  amount numeric(10,2) not null default 0,
  status public.winner_status not null default 'pending_verification',
  proof_url text,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, draw_id, match_type)
);

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users
for each row execute function public.touch_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions
for each row execute function public.touch_updated_at();

drop trigger if exists charities_updated_at on public.charities;
create trigger charities_updated_at before update on public.charities
for each row execute function public.touch_updated_at();

drop trigger if exists user_charity_updated_at on public.user_charity;
create trigger user_charity_updated_at before update on public.user_charity
for each row execute function public.touch_updated_at();

drop trigger if exists scores_updated_at on public.scores;
create trigger scores_updated_at before update on public.scores
for each row execute function public.touch_updated_at();

drop trigger if exists scores_trim_limit on public.scores;
create trigger scores_trim_limit after insert on public.scores
for each row execute function public.trim_scores_limit();

drop trigger if exists draws_updated_at on public.draws;
create trigger draws_updated_at before update on public.draws
for each row execute function public.touch_updated_at();

drop trigger if exists prize_pool_config_updated_at on public.prize_pool_config;
create trigger prize_pool_config_updated_at before update on public.prize_pool_config
for each row execute function public.touch_updated_at();

drop trigger if exists winners_updated_at on public.winners;
create trigger winners_updated_at before update on public.winners
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
declare
  configured_admins text[];
  metadata_full_name text;
  resolved_role public.user_role;
begin
  configured_admins := string_to_array(coalesce(current_setting('app.settings.admin_emails', true), ''), ',');
  metadata_full_name := nullif(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), '');

  resolved_role := case
    when lower(new.email) = any(configured_admins) then 'admin'
    else 'subscriber'
  end;

  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, metadata_full_name, resolved_role)
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name),
      role = public.users.role;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.charities enable row level security;
alter table public.user_charity enable row level security;
alter table public.donations enable row level security;
alter table public.scores enable row level security;
alter table public.draws enable row level security;
alter table public.prize_pool_config enable row level security;
alter table public.draw_results enable row level security;
alter table public.winners enable row level security;

drop policy if exists "Users can read own user record" on public.users;
create policy "Users can read own user record"
  on public.users for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own user record" on public.users;
create policy "Users can update own user record"
  on public.users for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "Admins can insert users" on public.users;
create policy "Admins can insert users"
  on public.users for insert
  with check (public.is_admin() or auth.uid() = id);

drop policy if exists "Users can view own subscription" on public.subscriptions;
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins manage subscriptions" on public.subscriptions;
create policy "Admins manage subscriptions"
  on public.subscriptions for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Anyone can view charities" on public.charities;
create policy "Anyone can view charities"
  on public.charities for select
  using (true);

drop policy if exists "Admins manage charities" on public.charities;
create policy "Admins manage charities"
  on public.charities for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users manage own charity selection" on public.user_charity;
create policy "Users manage own charity selection"
  on public.user_charity for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users manage own donations" on public.donations;
create policy "Users manage own donations"
  on public.donations for all
  using (auth.uid() = user_id or public.is_admin() or user_id is null)
  with check (auth.uid() = user_id or public.is_admin() or user_id is null);

drop policy if exists "Users manage own scores" on public.scores;
create policy "Users manage own scores"
  on public.scores for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Authenticated users can view published draws" on public.draws;
create policy "Authenticated users can view published draws"
  on public.draws for select
  using (status = 'published' or auth.uid() is not null or public.is_admin());

drop policy if exists "Admins manage draws" on public.draws;
create policy "Admins manage draws"
  on public.draws for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can view prize configs" on public.prize_pool_config;
create policy "Authenticated users can view prize configs"
  on public.prize_pool_config for select
  using (auth.uid() is not null or public.is_admin());

drop policy if exists "Admins manage prize configs" on public.prize_pool_config;
create policy "Admins manage prize configs"
  on public.prize_pool_config for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can view draw results" on public.draw_results;
create policy "Authenticated users can view draw results"
  on public.draw_results for select
  using (auth.uid() is not null or public.is_admin());

drop policy if exists "Admins manage draw results" on public.draw_results;
create policy "Admins manage draw results"
  on public.draw_results for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users view own winners" on public.winners;
create policy "Users view own winners"
  on public.winners for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users upload own proof" on public.winners;
create policy "Users upload own proof"
  on public.winners for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins insert winners" on public.winners;
create policy "Admins insert winners"
  on public.winners for insert
  with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('winner-proofs', 'winner-proofs', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload own winner proof" on storage.objects;
create policy "Users can upload own winner proof"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'winner-proofs'
    and auth.uid()::text = split_part(name, '/', 1)
  );

drop policy if exists "Users can view own winner proof" on storage.objects;
create policy "Users can view own winner proof"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'winner-proofs'
    and (auth.uid()::text = split_part(name, '/', 1) or public.is_admin())
  );

drop policy if exists "Users can update own winner proof" on storage.objects;
create policy "Users can update own winner proof"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'winner-proofs'
    and (auth.uid()::text = split_part(name, '/', 1) or public.is_admin())
  )
  with check (
    bucket_id = 'winner-proofs'
    and (auth.uid()::text = split_part(name, '/', 1) or public.is_admin())
  );
