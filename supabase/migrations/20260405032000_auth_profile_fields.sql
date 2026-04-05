alter table public.finance_profiles
  add column if not exists phone_number text not null default '';

alter table public.finance_profiles
  add column if not exists password_setup_completed boolean not null default false;
