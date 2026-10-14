-- QueerSafe: only trusted server-side administration may write safe places.
-- The admin Edge Function uses the service-role key on the server, which bypasses RLS.
drop policy if exists "members_submit_places_for_review" on public.safe_places;
revoke insert, update, delete on public.safe_places from anon, authenticated;
grant select on public.safe_places to authenticated;
