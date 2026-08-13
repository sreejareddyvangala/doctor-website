import { SeoHead } from '@/components/SeoHead';
import { PageHero } from '@/components/PageHero';
import { Gallery } from '@/components/sections/Gallery';

export default function GalleryPage() {
  return (
    <>
      <SeoHead
        title="Gallery"
        description="Photographs of the clinic facilities and consultation spaces."
      />

      <PageHero
        eyebrow="Gallery"
        title="Clinic gallery"
        description="A look at the consultation, examination and treatment facilities."
        crumbs={[{ label: 'Gallery' }]}
      />

      <Gallery tone="white" />
    </>
  );
}
