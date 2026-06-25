import { useState, useEffect } from 'react';
import { getGalleryImages } from '@/firebase/services/galleryService';
import type { GalleryImage } from '@/types';

interface UseGalleryResult {
  images: GalleryImage[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useGallery(): UseGalleryResult {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const allImages = await getGalleryImages();
      // Filter only active images - architecture rule: filter in query layer
      const activeImages = allImages.filter((img) => img.isActive);
      setImages(activeImages);
    } catch (err) {
      console.error('Failed to fetch gallery images:', err);
      setError('Gagal memuat galeri. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return {
    images,
    loading,
    error,
    retry: fetchImages,
  };
}
