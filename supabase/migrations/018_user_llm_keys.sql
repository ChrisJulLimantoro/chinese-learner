create table if not exists public.user_llm_keys (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  encrypted_key text not null,
  key_hint      text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.user_llm_keys enable row level security;

revoke all on public.user_llm_keys from anon, authenticated;
