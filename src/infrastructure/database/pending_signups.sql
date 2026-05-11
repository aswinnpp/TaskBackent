create table if not exists pending_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  phone text not null unique,
  hashed_password text not null,
  encrypted_password text not null,
  expires_at timestamptz not null,
  attempt_count integer not null default 0,
  resend_count integer not null default 0,
  otp_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pending_signups_phone on pending_signups(phone);
create index if not exists idx_pending_signups_email on pending_signups(email);
create index if not exists idx_pending_signups_expires_at on pending_signups(expires_at);
