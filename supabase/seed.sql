-- =====================================================================
--  Seed data
--
--  Doctor, clinics, fees and consultation times are taken from the live
--  website (src/data/site.ts and src/data/locations.ts) — nothing invented.
--
--  ⚠  WORKING DAYS ARE A PLACEHOLDER
--  The website publishes consultation *times* but never says which days
--  the doctor sits at each clinic. Monday–Saturday is assumed below so the
--  booking flow is testable. Confirm the real days and edit the
--  `days as (...)` lists before this goes anywhere near patients.
--
--  Safe to re-run: every insert is idempotent on its natural key.
-- =====================================================================

-- ------------------------------------------------------------- doctors
insert into doctors (name, slug, specialization, active)
values (
  'Dr. S. Kranthi Reddy',
  'dr-s-kranthi-reddy',
  'Consultant Trauma & Arthroplasty Surgeon',
  true
)
on conflict (slug) do update
  set name           = excluded.name,
      specialization = excluded.specialization,
      active         = excluded.active;

-- ------------------------------------------------------------- clinics
insert into clinics (name, slug, maps_url, consultation_fee, active)
values
  ('Dr. Goutami''s Children''s Clinic & Ortho Care', 'goutami',
   'https://maps.app.goo.gl/FyazeYKyYKhwHjCo7', 500, true),
  ('Regain Bone and Joint Care Centre', 'regain',
   'https://maps.app.goo.gl/Kez14oSyQC5ixbwu6', 500, true),
  ('Archana Hospital', 'archana',
   'https://maps.app.goo.gl/EbhVKrnGaTcmH9kTA', 600, true)
on conflict (slug) do update
  set name             = excluded.name,
      maps_url         = excluded.maps_url,
      consultation_fee = excluded.consultation_fee,
      active           = excluded.active;

-- -------------------------------------------------- doctor availability
--  Goutami   09:30–10:30 (Prior Booking)  and  19:30–21:30
--  Regain    11:00–14:00
--  Archana   17:30–19:30
--
--  These four windows never overlap, which the
--  doctor_availability_no_overlap constraint requires.
--  Slot length: 30 minutes.
with doc as (
  select id from doctors where slug = 'dr-s-kranthi-reddy'
),
windows as (
  select * from (values
    ('goutami', time '09:30', time '10:30'),
    ('goutami', time '19:30', time '21:30'),
    ('regain',  time '11:00', time '14:00'),
    ('archana', time '17:30', time '19:30')
  ) as w(clinic_slug, start_time, end_time)
),
days as (
  -- 1 = Monday … 6 = Saturday. ⚠ placeholder — see note at top of file.
  select generate_series(1, 6) as day_of_week
)
insert into doctor_availability (
  doctor_id, clinic_id, day_of_week, start_time, end_time, slot_duration_minutes, active
)
select doc.id, c.id, d.day_of_week, w.start_time, w.end_time, 30, true
from doc
cross join windows w
join clinics c on c.slug = w.clinic_slug
cross join days d
on conflict do nothing;
