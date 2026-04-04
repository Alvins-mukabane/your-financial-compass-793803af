create or replace function public.set_finance_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.finance_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  legacy_public_user_id uuid unique,
  first_name text not null default '',
  last_name text not null default '',
  country text not null default '',
  user_type text not null default 'personal' check (user_type in ('personal', 'business')),
  updates_opt_in boolean not null default true,
  cash_balance numeric not null default 0,
  monthly_income numeric not null default 0,
  monthly_fixed_expenses numeric not null default 0,
  budgeting_focus text not null default '',
  intent_focus text not null default '',
  biggest_problem text not null default '',
  money_style text not null default '',
  guidance_style text not null default 'balanced',
  goal_focus text not null default '',
  subscription_awareness text not null default '',
  target_monthly_savings numeric not null default 0,
  onboarding_completed boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null default 0,
  current_amount numeric not null default 0,
  deadline date not null,
  icon text not null default '🎯',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_budget_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  monthly_limit numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, category)
);

create table if not exists public.finance_spending_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  items jsonb not null default '[]'::jsonb,
  raw_input text not null default '',
  total numeric not null default 0,
  source text not null default 'chat_manual',
  created_at timestamptz not null default now()
);

create table if not exists public.finance_financial_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  entry_type text not null check (entry_type in ('asset', 'liability')),
  value numeric not null default 0,
  cashflow numeric not null default 0,
  balance numeric not null default 0,
  payment numeric not null default 0,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  price numeric not null default 0,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly')),
  category text not null default 'Other',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  insight_type text not null default 'summary',
  period text not null default 'manual',
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  source text not null default 'eva',
  created_at timestamptz not null default now()
);

create table if not exists public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_type text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  reason text not null default '',
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  trace_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null,
  risk_class text not null default 'medium' check (risk_class in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  title text not null,
  description text not null default '',
  request_payload jsonb not null default '{}'::jsonb,
  execution_intent jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_finance_goals_user_id on public.finance_goals(user_id);
create index if not exists idx_finance_budget_limits_user_id on public.finance_budget_limits(user_id);
create index if not exists idx_finance_spending_events_user_id_date on public.finance_spending_events(user_id, date desc);
create index if not exists idx_finance_financial_entries_user_id on public.finance_financial_entries(user_id);
create index if not exists idx_finance_subscriptions_user_id on public.finance_subscriptions(user_id);
create index if not exists idx_finance_insights_user_id_created_at on public.finance_insights(user_id, created_at desc);
create index if not exists idx_agent_tasks_user_id_created_at on public.agent_tasks(user_id, created_at desc);
create index if not exists idx_approval_requests_user_id_created_at on public.approval_requests(user_id, created_at desc);

alter table public.finance_profiles enable row level security;
alter table public.finance_goals enable row level security;
alter table public.finance_budget_limits enable row level security;
alter table public.finance_spending_events enable row level security;
alter table public.finance_financial_entries enable row level security;
alter table public.finance_subscriptions enable row level security;
alter table public.finance_insights enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.approval_requests enable row level security;

drop policy if exists "Users can read own finance profile" on public.finance_profiles;
create policy "Users can read own finance profile"
  on public.finance_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own finance profile" on public.finance_profiles;
create policy "Users can insert own finance profile"
  on public.finance_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own finance profile" on public.finance_profiles;
create policy "Users can update own finance profile"
  on public.finance_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own finance goals" on public.finance_goals;
create policy "Users can read own finance goals"
  on public.finance_goals
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can write own finance goals" on public.finance_goals;
create policy "Users can write own finance goals"
  on public.finance_goals
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own finance budget limits" on public.finance_budget_limits;
create policy "Users can read own finance budget limits"
  on public.finance_budget_limits
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can write own finance budget limits" on public.finance_budget_limits;
create policy "Users can write own finance budget limits"
  on public.finance_budget_limits
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own finance spending events" on public.finance_spending_events;
create policy "Users can read own finance spending events"
  on public.finance_spending_events
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can write own finance spending events" on public.finance_spending_events;
create policy "Users can write own finance spending events"
  on public.finance_spending_events
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own finance entries" on public.finance_financial_entries;
create policy "Users can read own finance entries"
  on public.finance_financial_entries
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can write own finance entries" on public.finance_financial_entries;
create policy "Users can write own finance entries"
  on public.finance_financial_entries
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own finance subscriptions" on public.finance_subscriptions;
create policy "Users can read own finance subscriptions"
  on public.finance_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can write own finance subscriptions" on public.finance_subscriptions;
create policy "Users can write own finance subscriptions"
  on public.finance_subscriptions
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own finance insights" on public.finance_insights;
create policy "Users can read own finance insights"
  on public.finance_insights
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can write own finance insights" on public.finance_insights;
create policy "Users can write own finance insights"
  on public.finance_insights
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own agent tasks" on public.agent_tasks;
create policy "Users can read own agent tasks"
  on public.agent_tasks
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can write own agent tasks" on public.agent_tasks;
create policy "Users can write own agent tasks"
  on public.agent_tasks
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own approval requests" on public.approval_requests;
create policy "Users can read own approval requests"
  on public.approval_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can write own approval requests" on public.approval_requests;
create policy "Users can write own approval requests"
  on public.approval_requests
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_finance_profiles_updated_at on public.finance_profiles;
create trigger set_finance_profiles_updated_at
before update on public.finance_profiles
for each row execute function public.set_finance_updated_at();

drop trigger if exists set_finance_goals_updated_at on public.finance_goals;
create trigger set_finance_goals_updated_at
before update on public.finance_goals
for each row execute function public.set_finance_updated_at();

drop trigger if exists set_finance_budget_limits_updated_at on public.finance_budget_limits;
create trigger set_finance_budget_limits_updated_at
before update on public.finance_budget_limits
for each row execute function public.set_finance_updated_at();

drop trigger if exists set_finance_financial_entries_updated_at on public.finance_financial_entries;
create trigger set_finance_financial_entries_updated_at
before update on public.finance_financial_entries
for each row execute function public.set_finance_updated_at();

drop trigger if exists set_finance_subscriptions_updated_at on public.finance_subscriptions;
create trigger set_finance_subscriptions_updated_at
before update on public.finance_subscriptions
for each row execute function public.set_finance_updated_at();

drop trigger if exists set_agent_tasks_updated_at on public.agent_tasks;
create trigger set_agent_tasks_updated_at
before update on public.agent_tasks
for each row execute function public.set_finance_updated_at();

drop trigger if exists set_approval_requests_updated_at on public.approval_requests;
create trigger set_approval_requests_updated_at
before update on public.approval_requests
for each row execute function public.set_finance_updated_at();
