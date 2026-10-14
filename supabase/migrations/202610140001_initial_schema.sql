-- QueerSafe initial backend schema.
-- Apply only in a new Supabase project after reviewing this migration.
-- All user-generated sensitive tables are protected with RLS. No live alert is public by default.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Membre QueerSafe' check (char_length(display_name) between 1 and 60),
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.safe_places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  category text not null check (category in ('association','cafe','bar','health','community_center','public_place','other')),
  description text not null default '' check (char_length(description) <= 1200),
  city text not null check (char_length(city) between 1 and 100),
  country_code char(2) not null,
  address text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  website_url text,
  phone text,
  accessibility_notes text,
  verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','published','rejected','archived')),
  submitted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verified_places_need_review check (not verified or (verified_at is not null and verified_by is not null))
);

create table if not exists public.place_reports (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.safe_places(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('closed','incorrect_info','safety_concern','accessibility','other')),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.safety_alerts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  city text not null check (char_length(city) between 1 and 100),
  coarse_latitude double precision check (coarse_latitude between -90 and 90),
  coarse_longitude double precision check (coarse_longitude between -180 and 180),
  radius_m integer not null default 1500 check (radius_m between 250 and 5000),
  message text not null default 'J’ai besoin d’aide. Peux-tu me contacter ?' check (char_length(message) between 1 and 500),
  status text not null default 'active' check (status in ('active','accepted','cancelled','expired','resolved')),
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.alert_responses (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.safety_alerts(id) on delete cascade,
  responder_id uuid not null references public.profiles(id) on delete cascade,
  response_type text not null check (response_type in ('call_user','contact_emergency_services','can_accompany','other')),
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  unique(alert_id, responder_id)
);

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_id, blocked_id),
  check(blocker_id <> blocked_id)
);

alter table public.profiles enable row level security;
alter table public.safe_places enable row level security;
alter table public.place_reports enable row level security;
alter table public.safety_alerts enable row level security;
alter table public.alert_responses enable row level security;
alter table public.user_blocks enable row level security;

revoke all on public.profiles, public.safe_places, public.place_reports, public.safety_alerts, public.alert_responses, public.user_blocks from anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert on public.safe_places to authenticated;
grant select, insert on public.place_reports to authenticated;
grant select, insert, update on public.safety_alerts to authenticated;
grant select, insert on public.alert_responses to authenticated;
grant select, insert, delete on public.user_blocks to authenticated;

create policy "profiles_read_self" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles_insert_self" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profiles_delete_self" on public.profiles for delete to authenticated using (id = (select auth.uid()));

-- Only published and verified places are visible to members.
create policy "members_read_verified_places" on public.safe_places for select to authenticated using (status = 'published' and verified = true);
create policy "members_submit_places_for_review" on public.safe_places for insert to authenticated with check (submitted_by = (select auth.uid()) and status = 'pending' and verified = false and verified_by is null and verified_at is null);
-- No member update/delete policy: moderation must happen in a trusted admin environment.

create policy "members_submit_place_reports" on public.place_reports for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "members_read_own_place_reports" on public.place_reports for select to authenticated using (reporter_id = (select auth.uid()));

-- Alerts are intentionally private in this first migration. Nearby users must not be able to list exact locations.
create policy "owner_read_own_alerts" on public.safety_alerts for select to authenticated using (owner_id = (select auth.uid()));
create policy "owner_create_own_alerts" on public.safety_alerts for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "owner_update_own_alerts" on public.safety_alerts for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy "members_read_own_responses" on public.alert_responses for select to authenticated using (responder_id = (select auth.uid()));
create policy "members_respond_as_self" on public.alert_responses for insert to authenticated with check (responder_id = (select auth.uid()));

create policy "members_read_blocks_they_created" on public.user_blocks for select to authenticated using (blocker_id = (select auth.uid()));
create policy "members_create_blocks_as_self" on public.user_blocks for insert to authenticated with check (blocker_id = (select auth.uid()));
create policy "members_delete_blocks_they_created" on public.user_blocks for delete to authenticated using (blocker_id = (select auth.uid()));

create index if not exists safe_places_city_status_idx on public.safe_places(city, status, verified);
create index if not exists place_reports_status_idx on public.place_reports(status, created_at desc);
create index if not exists safety_alerts_active_expiry_idx on public.safety_alerts(status, expires_at) where status in ('active','accepted');
create index if not exists safety_alerts_city_idx on public.safety_alerts(city, created_at desc);
create index if not exists alert_responses_alert_idx on public.alert_responses(alert_id, created_at);
