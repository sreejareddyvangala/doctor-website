import { Section, SectionHeading } from '@/components/Section';
import { galleryItems } from '@/data/content';

interface GalleryProps {
  headingLevel?: 'h1' | 'h2';
  tone?: 'white' | 'gray';
}

/**
 * Placeholder tiles only — no stock photography of identifiable people.
 * Adding an `image` to a gallery item in content.ts swaps the tile for a photo
 * with no change needed here.
 */
export function Gallery({ headingLevel = 'h2', tone = 'white' }: GalleryProps) {
  return (
    <Section id="gallery" tone={tone} ariaLabelledBy="gallery-heading">
      <SectionHeading
        as={headingLevel}
        id="gallery-heading"
        eyebrow="Gallery"
        title="Inside the clinic"
        description="These slots are reserved for genuine clinic photographs. Drop images into src/assets/gallery and map them in content.ts."
      />

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item) => (
          <li key={item.id}>
            <figure className="group h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.imageAlt ?? item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-48 w-full items-center justify-center bg-blue-50"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    Image slot
                  </span>
                </div>
              )}

              <figcaption className="border-t border-gray-100 p-5">
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{item.caption}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
