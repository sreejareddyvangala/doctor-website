-- =====================================================================
--  Phase 3 · 0003 — booking API (SECURITY DEFINER RPCs)
--
--  These two functions are the entire surface a patient can touch. The
--  browser holds only the anon key and has no table privileges on
--  appointments or patients, so slots and bookings must go through here.
--
--  Both pin search_path, so a hostile schema earlier on the path cannot
--  hijack an unqualified table reference inside a definer function.
-- =====================================================================

-- ---------------------------------------------------------------------
--  get_available_slots
--
--  Slots are generated from the doctor's configured windows — nothing is
--  hard-coded. A slot is returned only when it is not on a holiday, not
--  inside a break, not already taken, and not too soon (today only).
-- ---------------------------------------------------------------------
create or replace function get_available_slots(
  p_doctor_id uuid,
  p_clinic_id uuid,
  p_date      date
)
returns table (slot_start time, slot_end time)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_dow   smallint;
  v_today date      := clinic_today();
  v_now   timestamp := clinic_now();
  -- Minimum notice for a same-day booking.
  v_lead  interval  := interval '2 hours';
begin
  if p_doctor_id is null or p_clinic_id is null or p_date is null then
    return;
  end if;

  -- Never offer the past.
  if p_date < v_today then
    return;
  end if;

  -- Don't take bookings more than 90 days out.
  if p_date > v_today + 90 then
    return;
  end if;

  if not exists (select 1 from doctors d where d.id = p_doctor_id and d.active) then
    return;
  end if;

  if not exists (select 1 from clinics c where c.id = p_clinic_id and c.active) then
    return;
  end if;

  -- Holiday, either for this doctor or clinic-wide (doctor_id is null).
  if exists (
    select 1 from doctor_unavailable_dates u
    where u.unavailable_date = p_date
      and (u.doctor_id is null or u.doctor_id = p_doctor_id)
  ) then
    return;
  end if;

  v_dow := extract(dow from p_date)::smallint;  -- 0 = Sunday

  return query
  with windows as (
    select a.start_time, a.end_time, a.slot_duration_minutes
    from doctor_availability a
    where a.doctor_id  = p_doctor_id
      and a.clinic_id  = p_clinic_id
      and a.day_of_week = v_dow
      and a.active
  ),
  candidates as (
    select
      (w.start_time + (g.n * make_interval(mins => w.slot_duration_minutes)))::time       as s,
      (w.start_time + ((g.n + 1) * make_interval(mins => w.slot_duration_minutes)))::time as e
    from windows w
    cross join lateral generate_series(
      0,
      (floor(
        extract(epoch from (w.end_time - w.start_time)) / (w.slot_duration_minutes * 60)
      )::int) - 1
    ) as g(n)
  )
  select c.s, c.e
  from candidates c
  where
    -- not inside a configured break
    not exists (
      select 1 from doctor_breaks b
      where b.doctor_id = p_doctor_id
        and (b.clinic_id is null or b.clinic_id = p_clinic_id)
        and b.day_of_week = v_dow
        and b.start_time < c.e
        and b.end_time   > c.s
    )
    -- not already taken. Checked across every clinic, because the doctor
    -- cannot be in two places at once.
    and not exists (
      select 1 from appointments ap
      where ap.doctor_id        = p_doctor_id
        and ap.appointment_date = p_date
        and ap.status in ('pending', 'confirmed', 'rescheduled')
        and ap.start_time < c.e
        and ap.end_time   > c.s
    )
    -- same-day slots need the lead time
    and (p_date > v_today or (p_date + c.s) >= v_now + v_lead)
  order by c.s;
end;
$$;

-- ---------------------------------------------------------------------
--  book_appointment
--
--  Re-validates everything server-side. The frontend's checks are a
--  convenience; this function is the authority.
--
--  Errors use stable SQLSTATE codes so the UI can show a friendly message
--  without ever parsing internal text:
--    P0002  invalid name
--    P0003  invalid phone
--    P0004  invalid email
--    P0005  slot not available (unavailable, past, or gone)
--    23P01  exclusion violation — lost the race to another patient
-- ---------------------------------------------------------------------
create or replace function book_appointment(
  p_doctor_id  uuid,
  p_clinic_id  uuid,
  p_date       date,
  p_start_time time,
  p_full_name  text,
  p_phone      text,
  p_reason     text default null,
  p_email      text default null
)
returns table (
  appointment_ref  text,
  appointment_date date,
  start_time       time,
  end_time         time,
  status           appointment_status,
  doctor_name      text,
  clinic_name      text,
  patient_name     text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name       text := trim(coalesce(p_full_name, ''));
  v_phone      text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_email      text := nullif(trim(coalesce(p_email, '')), '');
  v_reason     text := nullif(trim(coalesce(p_reason, '')), '');
  v_end_time   time;
  v_patient_id uuid;
  v_appt       appointments%rowtype;
begin
  -- ---- name -------------------------------------------------------
  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'Please enter a valid full name.' using errcode = 'P0002';
  end if;

  -- ---- phone: accept +91 / 0 prefixes, store 10 digits -------------
  if length(v_phone) = 12 and left(v_phone, 2) = '91' then
    v_phone := right(v_phone, 10);
  elsif length(v_phone) = 11 and left(v_phone, 1) = '0' then
    v_phone := right(v_phone, 10);
  end if;

  if v_phone !~ '^[6-9][0-9]{9}$' then
    raise exception 'Please enter a valid 10-digit mobile number.' using errcode = 'P0003';
  end if;

  -- ---- optional email ---------------------------------------------
  if v_email is not null
     and v_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$' then
    raise exception 'Please enter a valid email address.' using errcode = 'P0004';
  end if;

  if v_reason is not null and char_length(v_reason) > 1000 then
    v_reason := left(v_reason, 1000);
  end if;

  -- ---- the requested slot must genuinely be on offer ---------------
  select s.slot_end into v_end_time
  from get_available_slots(p_doctor_id, p_clinic_id, p_date) s
  where s.slot_start = p_start_time;

  if v_end_time is null then
    raise exception 'That time slot is no longer available. Please choose another.'
      using errcode = 'P0005';
  end if;

  -- ---- patient upsert, keyed on phone ------------------------------
  insert into patients (full_name, phone, email)
  values (v_name, v_phone, v_email)
  on conflict (phone) do update
    set full_name  = excluded.full_name,
        -- never blank an address already on file
        email      = coalesce(excluded.email, patients.email),
        updated_at = now()
  returning id into v_patient_id;

  -- ---- the appointment itself --------------------------------------
  -- If two patients reach this line together, the exclusion constraint on
  -- appointments lets exactly one commit; the other lands in the handler.
  begin
    insert into appointments (
      patient_id, doctor_id, clinic_id,
      appointment_date, start_time, end_time, reason, status
    )
    values (
      v_patient_id, p_doctor_id, p_clinic_id,
      p_date, p_start_time, v_end_time, v_reason, 'pending'
    )
    returning * into v_appt;
  exception
    when exclusion_violation then
      raise exception 'That time slot has just been booked. Please choose another.'
        using errcode = 'P0005';
  end;

  return query
  select
    v_appt.appointment_ref,
    v_appt.appointment_date,
    v_appt.start_time,
    v_appt.end_time,
    v_appt.status,
    d.name,
    c.name,
    v_name
  from doctors d, clinics c
  where d.id = v_appt.doctor_id and c.id = v_appt.clinic_id;
end;
$$;

-- ---------------------------------------------------------------------
--  Execution grants — explicit, not inherited from PUBLIC.
-- ---------------------------------------------------------------------
revoke execute on function get_available_slots(uuid, uuid, date) from public;
revoke execute on function book_appointment(uuid, uuid, date, time, text, text, text, text) from public;

grant execute on function get_available_slots(uuid, uuid, date) to anon, authenticated;
grant execute on function book_appointment(uuid, uuid, date, time, text, text, text, text) to anon, authenticated;
