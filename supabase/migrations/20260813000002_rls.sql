-- =====================================================================
--  Phase 3 · 0002 — Row Level Security
--
--  Threat model: the browser only ever holds the anon key. Anything the
--  anon role can read is effectively public.
--
--    PUBLIC   clinics, doctors, availability, breaks, holidays
--             (working hours are already published on the website)
--    PRIVATE  patients, appointments, appointment_history, staff_profiles
--             (patient names and phone numbers — staff only)
--
--  Patients never read or write the appointments table directly. Booking
--  goes through the SECURITY DEFINER function in migration 0003, which is
--  the only path anon has to create a row.
-- =====================================================================

alter table clinics                   enable row level security;
alter table doctors                   enable row level security;
alter table doctor_availability       enable row level security;
alter table doctor_breaks             enable row level security;
alter table doctor_unavailable_dates  enable row level security;
alter table patients                  enable row level security;
alter table appointments              enable row level security;
alter table appointment_history       enable row level security;
alter table staff_profiles            enable row level security;

-- --------------------------------------------------------------- helper
-- SECURITY DEFINER so the lookup itself is not blocked by staff_profiles' RLS,
-- which would otherwise recurse.
create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from staff_profiles sp
    where sp.id = auth.uid() and sp.active
  );
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from staff_profiles sp
    where sp.id = auth.uid() and sp.active and sp.role = 'admin'
  );
$$;

revoke execute on function is_staff(), is_admin() from public;
grant execute on function is_staff(), is_admin() to anon, authenticated;

-- =====================================================================
--  PUBLIC REFERENCE DATA — readable by anyone, writable by staff only
-- =====================================================================
drop policy if exists clinics_public_read on clinics;
create policy clinics_public_read on clinics
  for select using (active);

drop policy if exists clinics_staff_all on clinics;
create policy clinics_staff_all on clinics
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists doctors_public_read on doctors;
create policy doctors_public_read on doctors
  for select using (active);

drop policy if exists doctors_staff_all on doctors;
create policy doctors_staff_all on doctors
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists availability_public_read on doctor_availability;
create policy availability_public_read on doctor_availability
  for select using (active);

drop policy if exists availability_staff_all on doctor_availability;
create policy availability_staff_all on doctor_availability
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists breaks_public_read on doctor_breaks;
create policy breaks_public_read on doctor_breaks
  for select using (true);

drop policy if exists breaks_staff_all on doctor_breaks;
create policy breaks_staff_all on doctor_breaks
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists holidays_public_read on doctor_unavailable_dates;
create policy holidays_public_read on doctor_unavailable_dates
  for select using (true);

drop policy if exists holidays_staff_all on doctor_unavailable_dates;
create policy holidays_staff_all on doctor_unavailable_dates
  for all to authenticated using (is_staff()) with check (is_staff());

-- =====================================================================
--  PATIENT DATA — staff only. No anon policy exists, so anon gets nothing.
-- =====================================================================
drop policy if exists patients_staff_all on patients;
create policy patients_staff_all on patients
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists appointments_staff_read on appointments;
create policy appointments_staff_read on appointments
  for select to authenticated using (is_staff());

drop policy if exists appointments_staff_write on appointments;
create policy appointments_staff_write on appointments
  for update to authenticated using (is_staff()) with check (is_staff());

-- Deletion is deliberately not granted: cancellation is a status change, so
-- the audit trail in appointment_history is never lost.

drop policy if exists history_staff_read on appointment_history;
create policy history_staff_read on appointment_history
  for select to authenticated using (is_staff());

-- =====================================================================
--  STAFF PROFILES
-- =====================================================================
drop policy if exists staff_read_self on staff_profiles;
create policy staff_read_self on staff_profiles
  for select to authenticated using (id = auth.uid() or is_admin());

drop policy if exists staff_admin_all on staff_profiles;
create policy staff_admin_all on staff_profiles
  for all to authenticated using (is_admin()) with check (is_admin());

-- =====================================================================
--  HARD GRANTS
--
--  Supabase grants the anon/authenticated roles broad table privileges by
--  default and relies on RLS to constrain them. Revoking here means that
--  even a mistakenly permissive policy added later cannot expose patient
--  data to anonymous visitors.
-- =====================================================================
revoke all on table patients            from anon;
revoke all on table appointments        from anon;
revoke all on table appointment_history from anon;
revoke all on table staff_profiles      from anon;

revoke insert, update, delete on table clinics                  from anon;
revoke insert, update, delete on table doctors                  from anon;
revoke insert, update, delete on table doctor_availability       from anon;
revoke insert, update, delete on table doctor_breaks             from anon;
revoke insert, update, delete on table doctor_unavailable_dates  from anon;

-- Staff reach these tables through `authenticated` + the policies above.
grant select, insert, update on table patients            to authenticated;
grant select, update         on table appointments        to authenticated;
grant select                 on table appointment_history to authenticated;
grant select, update         on table staff_profiles      to authenticated;
