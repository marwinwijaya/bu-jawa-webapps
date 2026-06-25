import SectionTitle from '@/components/ui/SectionTitle';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { useGallery } from '@/hooks/useGallery';

export default function GalleryPage() {
  const { images, loading, error, retry } = useGallery();

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <SectionTitle
          kicker="Galeri Kami"
          title="Suasana Rumah Makan Bu Jawa"
          description="Lihat suasana makan dan hidangan lezat yang kami sajikan setiap hari."
        />
        <GalleryGrid
          images={images}
          loading={loading}
          error={error}
          onRetry={retry}
        />
      </div>
    </section>
  );
}
