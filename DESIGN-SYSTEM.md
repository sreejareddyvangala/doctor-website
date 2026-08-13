# Design system — matched to the Rocket site

Extracted from the live site at `kranthiortho-plfvc33.public.builtwithrocket.new` and
reproduced here. **Do not introduce new fonts, colours, radii or shadows** — everything
below is the agreed visual language.

## Typography

The Rocket site links Inter but renders in Tailwind's **default `font-sans` stack**
(`ui-sans-serif, system-ui, …`). We therefore load **no webfont at all** and never override
`fontFamily`. This matches the live site's rendered type exactly and removes a render-blocking
request.

| Element         | Classes                                                    |
| --------------- | ---------------------------------------------------------- |
| Hero H1         | `text-4xl sm:text-5xl lg:text-6xl font-bold text-navy`     |
| Section H2      | `text-3xl sm:text-4xl font-bold text-gray-900 mb-3`        |
| Section eyebrow | `text-blue-700 text-sm font-semibold uppercase tracking-widest mb-2` |
| Section lede    | `text-gray-500 max-w-xl mx-auto`                           |
| Card title      | `text-lg font-bold text-gray-900`                          |
| Card body       | `text-gray-500 text-sm leading-relaxed`                    |

## Colour

| Token           | Value     | Used for                                    |
| --------------- | --------- | ------------------------------------------- |
| `navy`          | `#1a2e5a` | H1, primary Book Appointment button, CTA band |
| `navy-dark`     | `#142348` | navy hover                                  |
| `blue-700`      | `#1d4ed8` | links, eyebrows, form submit, active nav    |
| `blue-800`      | —         | blue hover                                  |
| `green-500`     | `#22c55e` | Call Now buttons                            |
| `green-600`     | —         | green hover + hero designation text         |
| `blue-50 / 100` | —         | location cards, icon circles, stat tiles    |
| `gray-50`       | —         | alternating section background              |
| `gray-900`      | —         | body text, footer background                |

Everything except `navy` is a stock Tailwind colour. No purple, orange, or other accents.

## Shape and depth

- Cards / panels: `rounded-2xl` (16px)
- Buttons / inputs: `rounded-lg` (8px)
- Card resting shadow: `shadow-sm` → `hover:shadow-lg`
- Form card: `shadow-lg`; hero portrait: `shadow-2xl border-4 border-white`
- Card borders: `border border-gray-100`, `hover:border-blue-200`

## Layout

- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Sections: `py-16 lg:py-24`, alternating `bg-white` / `bg-gray-50`
- Header: `fixed`, exactly **72px**, `bg-white`, `transition-shadow duration-200`
- Active nav item: `text-blue-700 border-b-2 border-blue-700`

## Section order (home page)

Matches the live site exactly:

`home` → `about` → `services` → `locations` → `testimonials` → `appointment` → `contact`

Additional content (qualifications, conditions, treatment process, FAQ, gallery) lives on
`/about`, `/services`, `/faq` and `/gallery` so the home page stays faithful to Rocket.

## Grids

| Section      | Mobile | Tablet | Desktop |
| ------------ | ------ | ------ | ------- |
| Services     | 1      | 2      | **3 × 2** |
| Locations    | 1      | 3      | 3       |
| Testimonials | 1      | 2      | 4       |

## Motion

The Rocket site uses **no scroll-reveal animation** — only colour/shadow/scale transitions on
hover (`duration-150` / `duration-200`, plus `group-hover:scale-105` on card images).
framer-motion has been removed entirely; `src/components/Reveal.tsx` is now a plain wrapper.

## Icons

Inline outline SVGs matching Rocket's (24×24, `fill=none`, `stroke=currentColor`, width 2),
defined in `src/components/icons.tsx`.
