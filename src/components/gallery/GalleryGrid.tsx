import { useState } from 'react';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import type { GalleryImage } from '@/types';

interface GalleryGridProps {
  images: GalleryImage[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function GalleryGrid({
  images,
  loading,
  error,
  onRetry,
}: GalleryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse aspect-square rounded-xl bg-cream-dark"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (images.length === 0) {
    return (
      <EmptyState
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z"
            />
          </svg>
        }
        title="Galeri belum tersedia"
        description="Foto-foto rumah makan akan segera hadir."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <GalleryCard key={image.id} image={image} />
      ))}
    </div>
  );
}

function GalleryCard({ image }: { image: GalleryImage }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={image.imageUrl}
        alt={image.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
      />
      {/* Title overlay on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-white font-medium text-sm sm:text-base line-clamp-2">
          {image.title}
        </p>
      </div>
    </div>
  );
}
