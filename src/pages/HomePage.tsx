import { Link } from 'react-router-dom';
import { useMenu } from '@/hooks/useMenu';
import { useGallery } from '@/hooks/useGallery';
import { formatPrice, openWhatsAppInquiry, openWhatsAppOrder } from '@/utils/format';
import MenuCard from '@/components/menu/MenuCard';
import SectionTitle from '@/components/ui/SectionTitle';
import Button from '@/components/ui/Button';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import Badge from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const RESTAURANT_NAME = 'Rumah Makan Bu Jawa';
const TAGLINE = 'Masakan Jawa Autentik';
const DESCRIPTION =
  'Rumah Makan Bu Jawa menyajikan hidangan Jawa autentik dengan cita rasa rumahan yang lezat. ' +
  'Dibuat dari bahan-bahan segar pilihan dan resep turun-temurun, setiap menu kami diracik dengan penuh cinta ' +
  'untuk memberikan pengalaman kuliner terbaik bagi Anda dan keluarga.';
const MAPS_URL = 'https://maps.app.goo.gl/XNuEpTYSbn5omncMA';
const OPENING_HOURS = '09.00 - 21.00 WIB';

/* ------------------------------------------------------------------ */
/*  Helper: WhatsApp icon (reused in multiple sections)                */
/* ------------------------------------------------------------------ */

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-brown-dark via-brown to-brown-light text-white overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {RESTAURANT_NAME}
          </h1>
          <p className="text-lg sm:text-xl text-cream-dark mb-8">
            {TAGLINE}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Lihat Menu
              </Button>
            </Link>
            <Button
              variant="whatsapp"
              size="lg"
              className="w-full sm:w-auto"
              onClick={openWhatsAppInquiry}
            >
              <WhatsAppIcon className="w-5 h-5 mr-2" />
              Hubungi Kami
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Menu Highlight Section                                             */
/* ------------------------------------------------------------------ */

function MenuHighlightSection() {
  const { items, loading, error, retry } = useMenu();

  // Pick favorites first, fallback to available items
  const favorites = items.filter((item) => item.isFavorite && item.isAvailable);
  const highlightItems = (
    favorites.length > 0
      ? favorites
      : items.filter((item) => item.isAvailable)
  ).slice(0, 3);

  return (
    <section className="py-12 sm:py-16 bg-cream">
      <div className="container mx-auto px-4">
        <SectionTitle
          kicker="Menu Andalan"
          title="Hidangan Favorit Kami"
          description="Cicipi menu paling digemari pelanggan setia Rumah Makan Bu Jawa."
        />

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-cream-dark overflow-hidden"
              >
                <div className="h-48 bg-brown/10" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-brown/10 rounded w-3/4" />
                  <div className="h-3 bg-brown/10 rounded w-full" />
                  <div className="h-3 bg-brown/10 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <ErrorState
            title="Gagal Memuat Menu"
            description={error}
            onRetry={retry}
          />
        )}

        {!loading && !error && highlightItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-brown-light">Menu belum tersedia saat ini.</p>
          </div>
        )}

        {!loading && !error && highlightItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlightItems.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/menu">
                <Button variant="outline" size="lg">
                  Lihat Semua Menu
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Gallery Preview Section                                            */
/* ------------------------------------------------------------------ */

function GalleryPreviewSection() {
  const { images, loading, error, retry } = useGallery();
  const previewImages = images.slice(0, 4);

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4">
        <SectionTitle
          kicker="Galeri"
          title="Suasana Rumah Makan Kami"
          description="Intip suasana makan dan hidangan lezat yang kami sajikan setiap hari."
        />

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse aspect-square rounded-xl bg-cream-dark"
              />
            ))}
          </div>
        )}

        {error && (
          <ErrorState
            title="Gagal Memuat Galeri"
            description={error}
            onRetry={retry}
          />
        )}

        {!loading && !error && previewImages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-brown-light">Galeri belum tersedia.</p>
          </div>
        )}

        {!loading && !error && previewImages.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-xl overflow-hidden group"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                    <p className="text-white font-medium text-sm line-clamp-2">
                      {image.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/gallery">
                <Button variant="outline" size="lg">
                  Lihat Galeri Lengkap
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  About Section (Tentang)                                            */
/* ------------------------------------------------------------------ */

function AboutSection() {
  return (
    <section className="py-12 sm:py-16 bg-cream">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <SectionTitle
            kicker="Tentang Kami"
            title={RESTAURANT_NAME}
            className="text-center"
          />
          <p className="text-brown-light leading-relaxed mb-6">
            {DESCRIPTION}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="available">Halal</Badge>
            <Badge variant="favorit">Resep Turun-Temurun</Badge>
            <Badge variant="available">Bahan Segar</Badge>
            <Badge variant="favorit">Pelayanan Ramah</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact Section (Kontak)                                           */
/* ------------------------------------------------------------------ */

function ContactSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4">
        <SectionTitle
          kicker="Hubungi Kami"
          title="Kontak & Lokasi"
          description="Kami siap melayani Anda setiap hari. Jangan ragu untuk menghubungi kami!"
          className="text-center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* WhatsApp */}
          <div className="bg-cream rounded-xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-leaf/10 rounded-full mb-4">
              <WhatsAppIcon className="w-7 h-7 text-green-leaf" />
            </div>
            <h3 className="font-semibold text-brown-dark mb-2">WhatsApp</h3>
            <p className="text-brown-light mb-4">0895-4057-18033</p>
            <Button
              variant="whatsapp"
              size="sm"
              onClick={openWhatsAppInquiry}
              className="w-full"
            >
              Chat Sekarang
            </Button>
          </div>

          {/* Lokasi */}
          <div className="bg-cream rounded-xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brown/10 rounded-full mb-4">
              <svg
                className="w-7 h-7 text-brown"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-brown-dark mb-2">Lokasi</h3>
            <p className="text-brown-light mb-4">Temukan kami di Google Maps</p>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full">
                Buka Maps
              </Button>
            </a>
          </div>

          {/* Jam Buka */}
          <div className="bg-cream rounded-xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brown/10 rounded-full mb-4">
              <svg
                className="w-7 h-7 text-brown"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-brown-dark mb-2">Jam Buka</h3>
            <p className="text-brown-light font-medium">{OPENING_HOURS}</p>
            <p className="text-brown-light text-sm mt-1">Buka setiap hari</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HomePage (default export)                                          */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MenuHighlightSection />
      <GalleryPreviewSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
