create table if not exists public.finance_sensitive_action_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null check (
    action_type in (
      'generate_statement',
      'review_draft_transaction',
      'receipt_forwarding',
      'security_settings'
    )
  ),
  code_hash text not null,
  delivery_target text not null default '',
  expires_at timestamptz not null,
  attempt_count integer not null default 0,
  verified_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_finance_sensitive_action_verifications_user_action_created
  on public.finance_sensitive_action_verifications(user_id, action_type, created_at desc);

alter table public.finance_sensitive_action_verifications enable row level security;

drop policy if exists "Users can read own finance security verifications" on public.finance_sensitive_action_verifications;
create policy "Users can read own finance security verifications"
  on public.finance_sensitive_action_verifications
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can write own finance security verifications" on public.finance_sensitive_action_verifications;
create policy "Users can write own finance security verifications"
  on public.finance_sensitive_action_verifications
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_finance_sensitive_action_verifications_updated_at on public.finance_sensitive_action_verifications;
create trigger set_finance_sensitive_action_verifications_updated_at
before update on public.finance_sensitive_action_verifications
for each row execute function public.set_finance_updated_at();
