# Drop your six service photos in THIS folder

Save each image here using the **exact filename** below. That is the only step —
the website picks them up automatically. No code changes, no imports to edit.

| Save this image as…              | Shows up on            |
| -------------------------------- | ---------------------- |
| `knee-replacement.jpg`           | Knee Replacement       |
| `hip-replacement.jpg`            | Hip Replacement        |
| `arthroscopy.jpg`                | Arthroscopy            |
| `trauma-care.jpg`                | Trauma Care            |
| `pelvic-surgery.jpg`             | Pelvic Surgery         |
| `complex-trauma-surgery.jpg`     | Complex Trauma Surgery |

`.jpeg`, `.png`, `.webp` and `.avif` also work — only the name before the dot matters,
and it must match exactly (all lowercase, hyphens not spaces).

## After saving

If the dev server is running, the images appear immediately on save. Otherwise:

```bash
npm run dev
```

## What happens until then

Each service falls back to its blue/green anatomical illustration, so the site keeps
working and the build never fails on a missing file. Once a photo is present it replaces
the illustration on **both** the service card and that service's detail page.

## Alt text is already written

Accessible descriptions for all six photographs are pre-written in
`src/data/services.ts` under each service's `photoAlt` field, and switch in automatically
alongside the image. If you swap in a different photograph, update that line to match.

## Sizing

Images are displayed in a fixed 4:3 box using `object-fit: cover`, so nothing stretches or
distorts regardless of the source aspect ratio. For best results use roughly 1200 × 900 px
and keep files under ~250 KB.
