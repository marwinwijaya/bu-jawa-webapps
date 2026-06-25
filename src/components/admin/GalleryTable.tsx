import { useState, useEffect } from 'react';
import { GalleryImage } from '@/types';
import { getGalleryImages, updateGalleryImage, deleteGalleryImage } from '@/firebase/services/galleryService';

export default function GalleryTable() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const data = await getGalleryImages();
      setImages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      setToggling(id);
      await updateGalleryImage(id, { isActive: !isActive });
      setImages((prev) => prev.map((img) => img.id === id ? { ...img, isActive: !isActive } : img));
    } catch (err) {
      console.error(err);
      alert('Gagal mengubah status');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Yakin ingin menghapus gambar ini?')) return;
    try {
      setDeleting(id);
      await deleteGalleryImage(id, imageUrl);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus gambar');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((img) => (
        <div key={img.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="aspect-video bg-gray-200">
            <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h3 className="font-medium mb-2">{img.title}</h3>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs rounded-full ${img.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {img.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(img.id, img.isActive)}
                  disabled={toggling === img.id}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {img.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button
                  onClick={() => handleDelete(img.id, img.imageUrl)}
                  disabled={deleting === img.id}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {deleting === img.id ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {images.length === 0 && (
        <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg">
          Belum ada gambar gallery
        </div>
      )}
    </div>
  );
}
