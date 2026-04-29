create table if not exists public.app_announcements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  audience text not null default 'all',
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_help_links (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  href text not null,
  category text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_config_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_crm_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text not null default '',
  status text not null default 'active' check (status in ('active', 'muted', 'support_follow_up', 'archived')),
  updates_opt_in boolean not null default false,
  last_contacted_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_contact_crm_records_email
  on public.contact_crm_records(lower(email));

create table if not exists public.contact_crm_events (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contact_crm_records(id) on delete cascade,
  event_type text not null check (event_type in ('signup', 'support_request', 'campaign_send', 'campaign_open', 'manual_note')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.outbound_campaign_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_key text not null,
  subject text not null,
  audience text not null default 'updates_opt_in',
  body text not null default '',
  sent_count integer not null default 0,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_announcements enable row level security;
alter table public.app_help_links enable row level security;
alter table public.app_config_flags enable row level security;
alter table public.contact_crm_records enable row level security;
alter table public.contact_crm_events enable row level security;
alter table public.outbound_campaign_logs enable row level security;

drop policy if exists "Authenticated users can read announcements" on public.app_announcements;
create policy "Authenticated users can read announcements"
  on public.app_announcements
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read help links" on public.app_help_links;
create policy "Authenticated users can read help links"
  on public.app_help_links
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read config flags" on public.app_config_flags;
create policy "Authenticated users can read config flags"
  on public.app_config_flags
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read own crm record" on public.contact_crm_records;
create policy "Authenticated users can read own crm record"
  on public.contact_crm_records
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Authenticated users can read own crm events" on public.contact_crm_events;
create policy "Authenticated users can read own crm events"
  on public.contact_crm_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.contact_crm_records records
      where records.id = contact_id
        and records.user_id = auth.uid()
    )
  );

drop trigger if exists set_app_announcements_updated_at on public.app_announcements;
create trigger set_app_announcements_updated_at
before update on public.app_announcements
for each row execute function public.set_finance_updated_at();

drop trigger if exists set_app_help_links_updated_at on public.app_help_links;
create trigger set_app_help_links_updated_at
before update on public.app_help_links
for each row execute function public.set_finance_updated_at();

drop trigger if exists set_app_config_flags_updated_at on public.app_config_flags;
create trigger set_app_config_flags_updated_at
before update on public.app_config_flags
for each row execute function public.set_finance_updated_at();

drop trigger if exists set_contact_crm_records_updated_at on public.contact_crm_records;
create trigger set_contact_crm_records_updated_at
before update on public.contact_crm_records
for each row execute function public.set_finance_updated_at();

drop trigger if exists set_outbound_campaign_logs_updated_at on public.outbound_campaign_logs;
create trigger set_outbound_campaign_logs_updated_at
before update on public.outbound_campaign_logs
for each row execute function public.set_finance_updated_at();
