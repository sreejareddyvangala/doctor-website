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

---

## Area Finder (`/area-finder`)

An AI-assisted tool that ranks the localities of a city by how promising they
are for a marketing campaign, given a business category. It lives in this repo
as a self-contained feature with its own shell (no clinic header, footer or
WhatsApp button) and is deliberately not linked from the clinic navigation.

Open http://localhost:5173/area-finder after `npm run dev`.

### How it works

Business category + city → `POST /api/area-analysis` → every locality is
scored 0–100 from four components (audience fit, activity, growth, white
space) → ranked list with a potential level (High ≥ 75, Medium ≥ 55, Low) and
a plain-language explanation.

The default data source is **OpenStreetMap** (`AREA_DATA_SOURCE=osm`, free, no
API key). For any city Nominatim can resolve, the named suburbs and
neighbourhoods become the candidate areas, and the mapped businesses, offices
and stations around each one are counted (never displayed) to measure
competition and to estimate activity, workforce, family and student presence.
Population, spending power and growth are not available from OpenStreetMap
and stay unconnected until another source supplies them; the engine
re-normalises its weights over the signals that exist.

Every response carries `coverage`, a per-signal provenance list (measured,
estimated, sample, or not connected) that the UI renders as a "Data coverage"
legend, plus the OpenStreetMap attribution the ODbL licence requires.

An **illustrative sample dataset** for five Indian cities remains available
with `AREA_DATA_SOURCE=mock` for offline development and tests. It is reported
as `dataSource.isSample: true` and shown with a "Sample data" badge.

### Where the code lives

```
shared/area-analysis/           Contract shared by browser and server
  contracts.ts                  Request / response types, potential thresholds
  catalog.ts                    Business categories (the product taxonomy)

server/                         Backend. Never imported by src/
  env.ts                        Configuration from environment variables
  app.ts                        Composition root (env → data source → handler)
  area-analysis/
    handler.ts                  HTTP layer on standard Request / Response
    service.ts                  Orchestration: signals → score → rank → explain
    validate.ts                 Request validation
    engine/                     Scoring model, category profiles, explanations
    data-sources/               AreaDataSource interface + implementations
      osm/                      OpenStreetMap (default): Nominatim + Overpass,
                                classification, aggregation, polite HTTP, cache
      mock/                     Sample dataset (AREA_DATA_SOURCE=mock)
  node-adapter.ts               Node http ↔ standard Request / Response
  vite-plugin.ts                Mounts the API in `vite dev` and `vite preview`
  index.ts                      Standalone production server (API + dist/)

src/lib/area-analysis/client.ts The only place the UI calls the API
src/features/area-finder/       UI: page, components, hooks
```

### API

| Method | Path | Body → Response |
| --- | --- | --- |
| `POST` | `/api/area-analysis` | `{ categoryId, city }` → `AreaAnalysisResponse` |
| `GET` | `/api/area-analysis/cities` | → `{ cities, dataSource }` |

Errors are JSON, `{ error: { code, message, issues? } }`, with 400 / 404 /
405 / 413 / 500 status codes, plus 503 with a `Retry-After` header when an
upstream map service is unavailable.

### The OpenStreetMap source

For a city the cache has not seen, the source makes exactly three upstream
requests, then serves it from `.cache/osm/` (git-ignored) for
`AREA_OSM_CACHE_TTL_HOURS` (default one week):

1. **Nominatim** resolves the typed name to the city's boundary and bounding
   box. Common Indian abbreviations ("hyd", "blr", "bom") are expanded first,
   because Nominatim would otherwise match "hyd" to Holyhead in Wales. The
   settlement is preferred over a district of the same name ("Pune" is the
   city, not Pune District), and a city known only as a point, or whose
   bounding box spans more than 60 km, is queried as a 12 km radius around
   its centre.
2. **Overpass** lists the named `place=suburb|quarter|neighbourhood` inside
   the city's bounding box (`AREA_OSM_SCOPE=bbox`, the default). The exact
   administrative boundary (`area`) is supported but the public instance
   answers it about thirty times slower (measured: 87 s versus 3 s).
3. **Overpass** returns mapped shops, eateries, schools, clinics, gyms, salons,
   service businesses, offices and stations. Each is classified into the
   engine's seven competition buckets and counted within an
   `AREA_OSM_CATCHMENT_RADIUS_M` (default 1.5 km) circle around every locality
   centre.

Localities with fewer than `AREA_OSM_MIN_POIS` mapped businesses are skipped
and reported in `notes`; at most `AREA_OSM_MAX_AREAS` are scored. Unknown city
names are remembered for a day so typos do not repeat lookups.

Counts are turned into 0–100 **percentile ranks within the city** rather than
a linear scale: mapping density in OpenStreetMap is very uneven, and ranks
stop one dense hub from flattening every other locality. That also makes
"50" mean "typical for this city", which is what the engine's competition
baseline assumes. Raw counts are what gets cached, so scaling can change
without another download.

Usage-policy safeguards live in `server/area-analysis/data-sources/osm/http.ts`:
one queued request at a time with a 1.1 s gap, an identifying `User-Agent`
(`AREA_OSM_USER_AGENT`, please set it), retries with backoff on 429 and 5xx,
and client-side timeouts. Concurrent requests for the same city share one
fetch, and different spellings of a cached city ("hyd", "Hyderabad") share
one download. A 429 from either service is honoured with a long backoff
(10 s, then 30 s, or the `Retry-After` header if larger).

The first analysis of a city took 36 s for Hyderabad and 108 s for Pune in
testing. The queries themselves finish in seconds; the rest is the public
Overpass instance queueing a client that has just run other heavy queries,
so back-to-back first runs are the slow case. The UI explains the wait after
a few seconds, `npm run osm:warm` (optionally followed by city names)
pre-fetches cities ahead of time, and `AREA_OSM_OVERPASS_URL` can point at a
mirror or a self-hosted instance for production use.

| Signal | Provenance | Derived from |
| --- | --- | --- |
| Competition (7 buckets) | Measured | Business counts per bucket |
| Footfall | Estimated | Commercial density plus rail and bus stations |
| Young professionals | Estimated | Office and co-working density |
| Families | Estimated | Schools, kindergartens, playgrounds |
| Students | Estimated | Colleges, universities, hostels |
| Population, spending power, growth | Not connected | Left undefined for future sources |

### Connecting more data

1. Implement `AreaDataSource` (`server/area-analysis/data-sources/types.ts`)
   in a new folder, e.g. `data-sources/worldpop/`, reading credentials from
   `ServerEnv` (`server/env.ts`), never from the browser. Supply whichever
   `AreaSignals` fields the source can measure and describe them in
   `coverage`; the engine re-normalises over what is present.
2. Add its id to `DATA_SOURCE_IDS` and a case in `createAreaDataSource`.
3. Set `AREA_DATA_SOURCE=<id>` in `.env.local`.

To generate explanations with an LLM, implement `ExplanationProvider`
(`server/area-analysis/engine/explain.ts`) and pass it in `server/app.ts`.
The rule-based provider stays as the fallback.

### Running and deploying

Requires Node 22.18 or newer: the server and tests run TypeScript directly.

| Command | What it does |
| --- | --- |
| `npm run dev` | UI + API on http://localhost:5173 |
| `npm test` | Engine, validation, sample-data, OpenStreetMap (fixture-based, no network) and HTTP tests |
| `npm run build && npm run preview` | Production bundle + API on http://localhost:4173 |
| `npm run build && npm start` | Standalone Node server (API + `dist/`) on `PORT` (default 8787) |
| `npm run osm:warm -- Hyderabad Pune` | Pre-fetch OpenStreetMap data for cities (defaults to `AREA_OSM_SUGGESTED_CITIES`) |

The handler is a plain `(Request) => Promise<Response>` function, so it can
also be deployed to a Supabase Edge Function, Vercel, Netlify or Cloudflare
with a few lines of adapter. Point the UI at it with
`VITE_AREA_ANALYSIS_API_URL` and allow the UI's origin via
`AREA_API_ALLOWED_ORIGINS`.
