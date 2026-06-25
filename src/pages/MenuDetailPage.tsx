import { useParams, Link } from 'react-router-dom';
import { useMenu } from '@/hooks/useMenu';
import { formatPrice } from '@/utils/format';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';

export default function MenuDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { items, loading, error, retry } = useMenu();

  // Loading state
  if (loading) {
    return (
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <div className="h-6 w-24 bg-brown/10 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-64 sm:h-80 bg-brown/10 animate-pulse" />
            <div className="p-6 space-y-4">
              <div className="h-4 w-32 bg-brown/10 rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-brown/10 rounded animate-pulse" />
              <div className="h-4 w-full bg-brown/10 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-brown/10 rounded animate-pulse" />
              <div className="h-6 w-40 bg-brown/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <BackButton />
          <ErrorState
            title="Gagal Memuat Menu"
            description={error}
            onRetry={retry}
          />
        </div>
      </section>
    );
  }

  // Empty data state (no menu items at all)
  if (items.length === 0) {
    return (
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <BackButton />
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            title="Menu Belum Tersedia"
            description="Daftar menu belum tersedia saat ini. Silakan cek kembali nanti."
            action={
              <Link to="/menu">
                <Button variant="outline">Kembali ke Menu</Button>
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  // Find item by slug
  const item = items.find((i) => i.slug === slug);

  // Item not found state
  if (!item) {
    return (
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <BackButton />
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            title="Menu Tidak Ditemukan"
            description="Menu yang Anda cari tidak tersedia atau sudah tidak ada."
            action={
              <Link to="/menu">
                <Button variant="outline">Kembali ke Menu</Button>
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  // Item found - show detail
  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <BackButton />

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80 md:h-96 bg-gray-200">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Gambar tidak tersedia</span>
              </div>
            )}

            {/* Badges overlay */}
            <div className="absolute top-3 left-3 flex gap-2">
              {item.isFavorite && (
                <Badge variant="favorit" className="text-sm px-3 py-1">
                  ★ Favorit
                </Badge>
              )}
              {!item.isAvailable && (
                <Badge variant="habis" className="text-sm px-3 py-1">
                  Habis
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 md:p-8">
            {/* Category */}
            <p className="text-sm font-medium text-green-leaf uppercase tracking-wider mb-2">
              {item.categoryName}
            </p>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-brown-dark mb-3">
              {item.name}
            </h1>

            {/* Description */}
            {item.description && (
              <p className="text-brown-light leading-relaxed mb-6">
                {item.description}
              </p>
            )}

            {/* Price & CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-cream-dark">
              <div>
                <p className="text-xs text-gray-500 mb-1">Harga</p>
                <p className="text-2xl sm:text-3xl font-bold text-brown">
                  {formatPrice(item.price)}
                </p>
              </div>

              {item.isAvailable ? (
                <WhatsAppButton
                  itemName={item.name}
                  price={item.price}
                  size="lg"
                  className="w-full sm:w-auto"
                />
              ) : (
                <Button variant="outline" size="lg" disabled className="w-full sm:w-auto">
                  Tidak Tersedia
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Back to menu link at bottom */}
        <div className="mt-6 text-center">
          <Link
            to="/menu"
            className="inline-flex items-center text-brown hover:text-brown-dark transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Lihat Menu Lainnya
          </Link>
        </div>
      </div>
    </section>
  );
}

function BackButton() {
  return (
    <Link
      to="/menu"
      className="inline-flex items-center text-sm text-brown hover:text-brown-dark transition-colors mb-6"
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Kembali ke Menu
    </Link>
  );
}
