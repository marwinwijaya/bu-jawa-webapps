import { useState } from 'react';
import { createGalleryImage } from '@/firebase/services/galleryService';
import { uploadImage } from '@/firebase/services/storageService';

interface GalleryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GalleryForm({ onSuccess, onCancel }: GalleryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul wajib diisi');
      return;
    }
    if (!imageFile) {
      setError('Gambar wajib diupload');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const imageUrl = await uploadImage(imageFile, `gallery/${Date.now()}-${imageFile.name}`);
      await createGalleryImage({
        title: title.trim(),
        imageUrl,
        isActive: true,
        order: 0,
        createdAt: new Date() as any,
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Gagal mengupload gambar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">Upload Gambar Gallery</h2>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Judul *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Gambar *</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full"
          required
        />
        {imageFile && (
          <p className="text-sm text-gray-500 mt-1">File: {imageFile.name}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-brown-600 text-white px-6 py-2 rounded-lg hover:bg-brown-700 disabled:opacity-50"
        >
          {loading ? 'Mengupload...' : 'Upload'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
