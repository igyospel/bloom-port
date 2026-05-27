-- Run this in Supabase SQL Editor
-- Table to store one-time password codes for email verification

create table if not exists public.otp_codes (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null,
  code        text        not null,
  purpose     text        not null check (purpose in ('login', 'signup')),
  name        text,
  expires_at  timestamptz not null,
  used        boolean     not null default false,
  created_at  timestamptz not null default now()
);

-- Index for fast lookup by email
create index if not exists otp_codes_email_idx on public.otp_codes (email);

-- Auto-delete expired/used codes after 1 hour (keeps table clean)
-- Run this separately as a cron job or pg_cron if available:
-- delete from public.otp_codes where expires_at < now() - interval '1 hour';

-- Row Level Security: only service role can access (API routes use service role key)
alter table public.otp_codes enable row level security;

-- No public access — all access is via server-side service role key
create policy "Service role only" on public.otp_codes
  using (false)
  with check (false);
