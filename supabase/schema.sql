-- RepZero: account sync schema.
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- Every table is scoped to auth.uid() via row-level security, so a signed-in
-- user can only ever read or write their own rows.

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goal text not null,
  experience text not null,
  days_per_week int not null,
  equipment text not null,
  diet_pattern text not null,
  allergies text[] not null default '{}',
  age_confirmed boolean not null default false,
  display_name text,
  food_likes text[],
  food_dislikes text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe to re-run: adds the columns above if this table already existed
-- from an earlier version of this schema.
alter table profiles add column if not exists food_likes text[];
alter table profiles add column if not exists food_dislikes text[];

create table if not exists scans (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  groups jsonb not null,
  body_composition jsonb,
  summary text not null default '',
  top_priorities text[] not null default '{}'
);

create table if not exists plans (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  days_per_week int not null,
  days jsonb not null,
  addresses_priorities text[] not null default '{}',
  summary text not null default ''
);

create table if not exists schedules (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schedule jsonb not null
);

create table if not exists habits (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null,
  created_at timestamptz not null default now(),
  archived boolean not null default false
);

create table if not exists habit_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null,
  date date not null,
  done boolean not null default false,
  primary key (user_id, habit_id, date)
);

create table if not exists water_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  ml int not null default 0,
  primary key (user_id, date)
);

create table if not exists nutrition_plans (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  target_calories int not null,
  maintenance_calories int not null,
  calorie_strategy text not null,
  macros jsonb not null,
  days jsonb not null,
  notes text not null default ''
);

create table if not exists chat_threads (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('coach', 'nutrition')),
  messages jsonb not null default '[]',
  primary key (user_id, kind)
);

alter table profiles enable row level security;
alter table scans enable row level security;
alter table plans enable row level security;
alter table schedules enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table water_logs enable row level security;
alter table nutrition_plans enable row level security;
alter table chat_threads enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'profiles', 'scans', 'plans', 'schedules', 'habits',
    'habit_logs', 'water_logs', 'nutrition_plans', 'chat_threads'
  ])
  loop
    execute format('drop policy if exists "own rows only" on %I;', t);
    execute format(
      'create policy "own rows only" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t
    );
  end loop;
end $$;
