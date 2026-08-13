# Supabase setup — Phase 3

Everything here is **schema and security only**. No UI is wired to the database
yet; that is Phase 4. The website continues to run normally with no Supabase
project configured.

---

## What you need to do

### 1. Create the project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Pick a region close to your patients (`ap-south-1`, Mumbai)
3. Save the database password somewhere safe — you cannot see it again

### 2. Run the migrations

**Option A — SQL Editor (no tooling needed)**

In the dashboard, open **SQL Editor** and run these files **in order**, one at a time:

1. `migrations/20260813000001_init.sql`
2. `migrations/20260813000002_rls.sql`
3. `migrations/20260813000003_functions.sql`
4. `seed.sql`

**Option B — Supabase CLI**

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

```bash
npx supabase db push
```

### 3. Add your keys

Copy `.env.example` to `.env.local` in the project root and fill in the two
`VITE_` values from **Project Settings → API**.

```bash
cp .env.example .env.local
```

`.env.local` is git-ignored. Restart `npm run dev` after editing it.

### 4. Create the receptionist login (Phase 5 prep)

In **Authentication → Users → Add user**, create the account, then run this in
the SQL Editor with that user's UUID:

```sql
insert into staff_profiles (id, full_name, role)
values ('PASTE-USER-UUID', 'Reception', 'admin');
```

A user with no row in `staff_profiles` can log in but sees nothing — `is_staff()`
returns false, so every policy denies them.

---

## ⚠ Confirm before real patients use this

`seed.sql` assumes the doctor consults **Monday–Saturday** at all three clinics.
The website publishes consultation *times* but never says which *days*, so this
is a placeholder. Correct the `days as (...)` block in `seed.sql`, or edit the
rows in the `doctor_availability` table.

Seeded times, taken from the live site:

| Clinic  | Window(s)                    | Fee  |
| ------- | ---------------------------- | ---- |
| Goutami | 09:30–10:30, 19:30–21:30     | ₹500 |
| Regain  | 11:00–14:00                  | ₹500 |
| Archana | 17:30–19:30                  | ₹600 |

Slot length is 30 minutes, configurable per window via
`doctor_availability.slot_duration_minutes`.

---

## How the security model works

The browser only ever holds the **anon key**. What it can reach:

| Table | anon | staff |
| --- | --- | --- |
| `clinics`, `doctors`, `doctor_availability`, `doctor_breaks`, `doctor_unavailable_dates` | read | read + write |
| `patients` | **none** | read + write |
| `appointments` | **none** | read + update |
| `appointment_history` | **none** | read |
| `staff_profiles` | **none** | own row; admins all |

Patients never touch `appointments` directly. Booking goes through
`book_appointment()`, a `SECURITY DEFINER` function — the single write path
available to anonymous visitors. Table privileges for `anon` are additionally
`REVOKE`d, so even a mistakenly permissive policy added later cannot leak
patient data.

**Double booking is prevented by PostgreSQL, not by application code:**

```sql
exclude using gist (doctor_id with =, slot with &&)
  where (status in ('pending','confirmed','rescheduled'))
```

If two patients submit the same slot at the same instant, one transaction
commits and the other raises `23P01`, which `book_appointment` converts into
"That time slot has just been booked." No amount of frontend racing can defeat
it. Cancelled and completed appointments are excluded from the constraint, so
freeing a slot makes it bookable again.

The doctor's availability windows carry a matching constraint, so the same
doctor cannot be scheduled at two clinics in overlapping hours.

---

## Quick verification

After running the migrations, in the SQL Editor:

```sql
select slot_start, slot_end
from get_available_slots(
  (select id from doctors where slug = 'dr-s-kranthi-reddy'),
  (select id from clinics where slug = 'regain'),
  (current_date + 1)
);
```

Expect six 30-minute slots between 11:00 and 14:00 — unless tomorrow is a
Sunday, which the seed treats as a non-working day.

To prove the double-booking guard, book one slot then try the same one again:

```sql
select * from book_appointment(
  (select id from doctors where slug = 'dr-s-kranthi-reddy'),
  (select id from clinics where slug = 'regain'),
  (current_date + 1), time '11:00',
  'Test Patient', '9876543210', 'Knee pain'
);
```

Running it a second time must fail with *"That time slot is no longer
available."*

---

## Files

| File | Purpose |
| --- | --- |
| `migrations/20260813000001_init.sql` | Extensions, enums, tables, constraints, triggers |
| `migrations/20260813000002_rls.sql` | Row Level Security policies and grants |
| `migrations/20260813000003_functions.sql` | `get_available_slots`, `book_appointment` |
| `seed.sql` | Doctor, three clinics, availability windows |
