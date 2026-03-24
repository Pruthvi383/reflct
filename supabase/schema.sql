create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  username text unique not null,
  image text,
  streak_count int default 0,
  longest_streak int default 0,
  streak_freezes int default 1,
  last_entry_date timestamptz,
  is_public boolean default true,
  reminder_time text default '18:00',
  learning_goal text,
  created_at timestamptz default now()
);

create table if not exists public.entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_start date not null,
  learnings text not null,
  focus_rating int check (focus_rating between 1 and 5),
  blocker text,
  next_goal text,
  prev_goal_met boolean,
  is_locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, week_start)
);

create table if not exists public.focus_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text not null,
  duration int not null,
  quality text check (quality in ('PRODUCTIVE', 'OKAY', 'DISTRACTED')) not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists public.wrapped (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  month int not null,
  year int not null,
  summary jsonb not null,
  is_public boolean default true,
  created_at timestamptz default now(),
  unique(user_id, month, year)
);

alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.wrapped enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (is_public = true);

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can CRUD own entries" on public.entries;
create policy "Users can CRUD own entries"
  on public.entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can CRUD own sessions" on public.focus_sessions;
create policy "Users can CRUD own sessions"
  on public.focus_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Public wrapped viewable by everyone" on public.wrapped;
create policy "Public wrapped viewable by everyone"
  on public.wrapped for select using (is_public = true);

drop policy if exists "Users can manage own wrapped" on public.wrapped;
create policy "Users can manage own wrapped"
  on public.wrapped for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists entries_updated_at on public.entries;
create trigger entries_updated_at
before update on public.entries
for each row execute function public.update_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
declare
  seed_username text;
begin
  seed_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    'user_' || substring(replace(new.id::text, '-', '') from 1 for 12)
  );

  insert into public.profiles (id, name, username, image)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    lower(seed_username),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
