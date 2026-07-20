-- Run this once in your Supabase project's SQL Editor (Supabase dashboard ->
-- SQL Editor -> New query -> paste this whole file -> Run).
--
-- Creates the purchases table and locks it down with Row Level Security so
-- that: (a) a logged-in user can only ever see their OWN purchases, and
-- (b) nobody can insert a purchase row through the public API - only the
-- Stripe webhook function can, because it uses the service_role key, which
-- bypasses RLS entirely. This is what makes it impossible to fake owning a
-- course by tampering with the browser/client code.

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  stripe_session_id text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_id_idx on public.purchases(user_id);

alter table public.purchases enable row level security;

-- Logged-in users can read their own purchase rows (used by account.html to
-- list "what have I bought"). No insert/update/delete policy is created for
-- the anon/authenticated roles on purpose - only the service role (used
-- exclusively by api/stripe-webhook.js) can write to this table.
create policy "Users can view their own purchases"
  on public.purchases
  for select
  using (auth.uid() = user_id);
