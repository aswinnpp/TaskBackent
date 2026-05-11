create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid null,
  "pushToken" text not null,
  "deviceType" text not null default 'unknown',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create unique index if not exists push_tokens_pushToken_unique on public.push_tokens ("pushToken");

