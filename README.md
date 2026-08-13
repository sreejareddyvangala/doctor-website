# Dr. S. Kranthi Reddy — Orthopedic Clinic Website

Production-ready website for **Dr. S. Kranthi Reddy**, Consultant Trauma & Arthroplasty Surgeon.

Built with React 18, Vite, TypeScript, Tailwind CSS, React Router and React Icons.

## Visual source of truth

The UI reproduces the approved Rocket site at
`kranthiortho-plfvc33.public.builtwithrocket.new` — fonts, colours, spacing, radii, shadows,
section order and responsive behaviour were extracted from the live site and matched.

**Read [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) before changing any styling.** Do not introduce a
new font, alter the blue/green palette, or add accent colours.

---

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173

| Script              | What it does                        |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Dev server with hot reload          |
| `npm run build`     | Typecheck + production build to `dist/` |
| `npm run preview`   | Serve the production build locally  |
| `npm run typecheck` | TypeScript check only               |

---

## Project structure

```
src/
  assets/          doctor photo + service illustrations
  components/      reusable UI (Button, Modal, Accordion, ServiceCard, …)
    sections/      page sections (Hero, Services, Locations, …)
  data/            ALL site content lives here — edit these to update the site
  hooks/           useScrollSpy, useCountUp, useMediaQuery, useLockBodyScroll
  layouts/         Header, Footer, RootLayout
  pages/           routed pages
  styles/          Tailwind entry + design tokens
  utils/           cn(), smooth-scroll helpers
```

### Where to edit content

Everything patient-facing is in `src/data/` — no need to touch components:

| File          | Contains                                                     |
| ------------- | ------------------------------------------------------------ |
| `site.ts`     | Doctor name, designation, phone, email, nav items            |
| `services.ts` | The six services and all their detail-page content           |
| `locations.ts`| The three clinics — timings, fees, Google Maps links          |
| `content.ts`  | Stats, qualifications, conditions, FAQs, testimonials, gallery |

---

## Routes

| Route | Page |
| ----- | ---- |
| `/` | Home (all sections) |
| `/about` | About the doctor |
| `/services` | Services overview |
| `/services/knee-replacement` | Service detail |
| `/services/hip-replacement` | Service detail |
| `/services/arthroscopy` | Service detail |
| `/services/trauma-care` | Service detail |
| `/services/pelvic-surgery` | Service detail |
| `/services/complex-trauma-surgery` | Service detail |
| `/appointment` | Appointment form |
| `/gallery` | Gallery |
| `/testimonials` | Testimonials |
| `/faq` | FAQ |
| `/contact` | Contact |
| `/privacy-policy`, `/terms-and-conditions` | Legal |

---

## Things to replace before going live

These are deliberately marked as placeholders in the UI so nothing misleading ships by accident.

### 1. Testimonials — **confirm before publishing**

`src/data/content.ts` → `testimonials`

The four testimonials are carried over verbatim from the live Rocket site and are presented to
visitors as genuine patient reviews (named, five stars). **Confirm you have real, consented
feedback behind them.** If they are illustrative rather than real, replace the text or label the
section clearly — publishing invented reviews as real is misleading and, for a medical practice,
carries regulatory risk.

### 2. Gallery images

`src/data/content.ts` → `galleryItems`

Six empty image slots. Add real clinic photographs to `src/assets/gallery/`, import them, and set the
`image` and `imageAlt` fields. The placeholder tile disappears automatically once `image` is set.

### 3. Service photographs — **done**

All six are in place at `src/assets/services/photos/`, downloaded from the live Rocket site and
optimised (32–55 KB each). To swap any of them, drop a replacement in using the same filename —
it is picked up automatically, no code change needed. See `HOW-TO-ADD-PHOTOS.md` in that folder.

> **Note:** the dev server caches the folder listing at startup. If you add or replace photos
> while `npm run dev` is running, restart it once.

**One mapping to double-check:** `pelvic-surgery.jpg` is the ankle-rehabilitation photograph and
`complex-trauma-surgery.jpg` is the minimally-invasive surgery photograph — this is the mapping
you specified, and it is the reverse of what the Rocket site currently shows. Swapping the two
filenames is all that is needed if you want Rocket's original pairing back.

### 4. Clinic addresses

No street addresses are shown anywhere, because none were supplied. Directions rely entirely on the
three official Google Maps links. Add addresses to `src/data/locations.ts` and render them in
`LocationCard` if you want them displayed.

---

## Appointment form

The form is **frontend-only**, as specified. On successful validation it shows a confirmation modal
and clears — it does **not** send an email, hit an API, or store anything.

There is a single `AppointmentForm` component (`src/components/AppointmentForm.tsx`), rendered in the
`#appointment` section on the home page and on `/appointment`. Service detail pages link to that same
form and pre-fill the reason field — they do not carry their own form.

**To connect a backend later**, the only change needed is in `handleSubmit`:

```ts
// Frontend-only flow: no network request, no storage. Show confirmation.
setConfirmed(values);
```

Replace that line with your API call, then call `setConfirmed(values)` on success.

Validation rules: name, phone, location, date and time are required; email is optional but validated
when filled; the date cannot be in the past; phone accepts 10-digit Indian mobile numbers with or
without a `+91`/`0` prefix.

---

## Accessibility

- Semantic landmarks, one `<h1>` per page, no heading-level skips
- Skip-to-content link
- Service cards are real `<a>` elements — keyboard focusable and Enter-activatable, with no nested
  interactive elements
- Modal traps focus, closes on Escape and backdrop click, restores focus to the trigger
- Accordions and dropdowns use `aria-expanded` / `aria-controls`
- All form controls have associated `<label>`s; errors use `role="alert"` and `aria-describedby`
- Visible focus ring on every interactive element
- `prefers-reduced-motion` disables animations and smooth scrolling

---

## Performance notes

- The supplied doctor photo was 1.9 MB PNG; it is now a 150 KB JPEG with a 61 KB 600 px variant
  served via `srcset`
- Every route except Home is code-split and lazy-loaded
- `react`/`react-dom`/`router` and `framer-motion` are split into separate vendor chunks
- Below-the-fold images are lazy-loaded; all images carry `width`/`height` to prevent layout shift

---

## Doctor photographs

Two distinct portraits, used in exactly one place each:

| File               | Used in | Shows                         |
| ------------------ | ------- | ----------------------------- |
| `doctor-hero.jpg`  | Hero    | Navy surgical scrubs and cap  |
| `doctor-about.jpg` | About   | White coat with stethoscope   |

Each has a `-sm.jpg` 600 px variant served via `srcset`. To replace either, drop in a new file at
the same path and regenerate the `-sm` variant at 600 px wide.

**Note on the embroidered name:** both photographs have "Dr. Kranthi Kumar Reddy" embroidered on the
garment. That text is part of the images and cannot be edited out. **All website copy uses
"Dr. S. Kranthi Reddy"** — the word "Kumar" appears nowhere in the site's text.
