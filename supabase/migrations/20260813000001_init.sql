-- =====================================================================
--  Phase 3 · 0001 — schema
--  Clinic appointment system for Dr. S. Kranthi Reddy
--
--  Timezone note: the clinic operates in a single timezone (Asia/Kolkata).
--  Appointments therefore store a plain `date` + `time` rather than a
--  timestamptz, and "today"/"now" are derived through clinic_today() /
--  clinic_now() so slot logic never drifts against the server's UTC clock.
-- =====================================================================

-- Required for the double-booking exclusion constraint (gist over uuid + range).
create extension if not exists btree_gist;

-- ---------------------------------------------------------------- enums
do $$ begin
  create type appointment_status as enum (
    'pending', 'confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type staff_role as enum ('receptionist', 'admin');
exception when duplicate_object then null;
end $$;

-- ------------------------------------------------------------- helpers
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function clinic_today()
returns date
language sql
stable
as $$
  select (now() at time zone 'Asia/Kolkata')::date;
$$;

create or replace function clinic_now()
returns timestamp
language sql
stable
as $$
  select (now() at time zone 'Asia/Kolkata');
$$;

-- ------------------------------------------------------------- clinics
-- The practice runs from three sites with different hours, so availability
-- is modelled per (doctor, clinic) rather than per doctor alone.
create table if not exists clinics (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  maps_url          text,
  consultation_fee  numeric(10, 2),
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ------------------------------------------------------------- doctors
create table if not exists doctors (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  specialization  text,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ------------------------------------------------------------ patients
-- Phone is the natural key: it is the one identifier every patient supplies
-- and the channel the clinic actually uses to reach them.
create table if not exists patients (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text not null unique,
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint patients_full_name_len check (char_length(trim(full_name)) between 2 and 120),
  -- Stored normalised: exactly 10 digits, Indian mobile range.
  constraint patients_phone_format check (phone ~ '^[6-9][0-9]{9}$'),
  constraint patients_email_format check (
    email is null or email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'
  )
);

-- ------------------------------------------------- doctor availability
-- One row per working window. A lunch gap is simply two windows; shorter
-- interruptions inside a window belong in doctor_breaks.
create table if not exists doctor_availability (
  id                     uuid primary key default gen_random_uuid(),
  doctor_id              uuid not null references doctors(id) on delete cascade,
  clinic_id              uuid not null references clinics(id) on delete cascade,
  day_of_week            smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday
  start_time             time not null,
  end_time               time not null,
  slot_duration_minutes  smallint not null default 30
                           check (slot_duration_minutes between 5 and 240),
  active                 boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint availability_window_valid check (end_time > start_time),
  -- Minute-of-day mirrors, so the overlap constraint below can use int4range
  -- (PostgreSQL has no built-in range type over `time`).
  start_minute int generated always as
    ((extract(hour from start_time) * 60 + extract(minute from start_time))::int) stored,
  end_minute int generated always as
    ((extract(hour from end_time) * 60 + extract(minute from end_time))::int) stored
);

-- A doctor cannot be in two places at once — this blocks overlapping windows
-- across *all* clinics for the same weekday, not just within one clinic.
alter table doctor_availability
  drop constraint if exists doctor_availability_no_overlap;
alter table doctor_availability
  add constraint doctor_availability_no_overlap
  exclude using gist (
    doctor_id   with =,
    day_of_week with =,
    int4range(start_minute, end_minute, '[)') with &&
  ) where (active);

-- --------------------------------------------------------------- breaks
create table if not exists doctor_breaks (
  id           uuid primary key default gen_random_uuid(),
  doctor_id    uuid not null references doctors(id) on delete cascade,
  clinic_id    uuid references clinics(id) on delete cascade, -- null = every clinic
  day_of_week  smallint not null check (day_of_week between 0 and 6),
  start_time   time not null,
  end_time     time not null,
  label        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint break_window_valid check (end_time > start_time)
);

-- ------------------------------------- holidays / unavailable calendar
-- doctor_id null = the whole clinic is closed that day.
create table if not exists doctor_unavailable_dates (
  id                uuid primary key default gen_random_uuid(),
  doctor_id         uuid references doctors(id) on delete cascade,
  unavailable_date  date not null,
  reason            text,
  created_at        timestamptz not null default now()
);

create unique index if not exists doctor_unavailable_per_doctor_idx
  on doctor_unavailable_dates (doctor_id, unavailable_date)
  where doctor_id is not null;

create unique index if not exists doctor_unavailable_clinic_wide_idx
  on doctor_unavailable_dates (unavailable_date)
  where doctor_id is null;

-- --------------------------------------------------------- appointments
create sequence if not exists appointment_ref_seq start 1;

create table if not exists appointments (
  id                uuid primary key default gen_random_uuid(),
  appointment_ref   text not null unique
                      default 'APT-' || lpad(nextval('appointment_ref_seq')::text, 6, '0'),
  patient_id        uuid not null references patients(id) on delete restrict,
  doctor_id         uuid not null references doctors(id)  on delete restrict,
  clinic_id         uuid not null references clinics(id)  on delete restrict,
  appointment_date  date not null,
  start_time        time not null,
  end_time          time not null,
  reason            text,
  status            appointment_status not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint appointment_window_valid check (end_time > start_time),
  constraint appointment_reason_len check (reason is null or char_length(reason) <= 1000),
  -- Materialised range used by the exclusion constraint below.
  slot tsrange generated always as (
    tsrange(appointment_date + start_time, appointment_date + end_time, '[)')
  ) stored
);

-- ---------------------------------------------------------------------
--  DOUBLE-BOOKING PROTECTION
--
--  Enforced by PostgreSQL, not by application code. Two concurrent
--  transactions requesting the same doctor + overlapping time: the first
--  commits, the second raises exclusion_violation (SQLSTATE 23P01).
--  Cancelled / completed / no-show rows are excluded so a freed slot
--  becomes bookable again.
-- ---------------------------------------------------------------------
alter table appointments
  drop constraint if exists appointments_no_double_booking;
alter table appointments
  add constraint appointments_no_double_booking
  exclude using gist (
    doctor_id with =,
    slot      with &&
  ) where (status in ('pending', 'confirmed', 'rescheduled'));

create index if not exists appointments_date_idx          on appointments (appointment_date);
create index if not exists appointments_doctor_date_idx   on appointments (doctor_id, appointment_date);
create index if not exists appointments_clinic_date_idx   on appointments (clinic_id, appointment_date);
create index if not exists appointments_status_idx        on appointments (status);
create index if not exists appointments_patient_idx       on appointments (patient_id);
create index if not exists patients_phone_idx             on patients (phone);

-- --------------------------------------------------- appointment history
create table if not exists appointment_history (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid not null references appointments(id) on delete cascade,
  action          text not null,
  from_status     appointment_status,
  to_status       appointment_status,
  notes           text,
  changed_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists appointment_history_appt_idx
  on appointment_history (appointment_id, created_at desc);

-- -------------------------------------------------------- staff profiles
-- Extends Supabase Auth users. Presence of an active row here is what makes
-- somebody "staff" — see is_staff() in the RLS migration.
create table if not exists staff_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        staff_role not null default 'receptionist',
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------- triggers
do $$
declare t text;
begin
  foreach t in array array[
    'clinics', 'doctors', 'patients', 'doctor_availability',
    'doctor_breaks', 'appointments', 'staff_profiles'
  ] loop
    execute format('drop trigger if exists set_updated_at on %I', t);
    execute format(
      'create trigger set_updated_at before update on %I
         for each row execute function set_updated_at()', t
    );
  end loop;
end $$;

-- Every status change is recorded automatically, so history cannot be
-- bypassed by writing straight to the table.
create or replace function log_appointment_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into appointment_history (appointment_id, action, to_status, changed_by)
    values (new.id, 'created', new.status, auth.uid());
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into appointment_history (appointment_id, action, from_status, to_status, changed_by)
    values (new.id, new.status::text, old.status, new.status, auth.uid());
  elsif new.appointment_date is distinct from old.appointment_date
     or new.start_time is distinct from old.start_time then
    insert into appointment_history (appointment_id, action, from_status, to_status, notes, changed_by)
    values (
      new.id, 'rescheduled', old.status, new.status,
      format('%s %s → %s %s', old.appointment_date, old.start_time,
                              new.appointment_date, new.start_time),
      auth.uid()
    );
  end if;

  return new;
end;
$$;

drop trigger if exists log_appointment_change on appointments;
create trigger log_appointment_change
  after insert or update on appointments
  for each row execute function log_appointment_change();
