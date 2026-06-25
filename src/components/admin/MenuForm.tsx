import { useState, useEffect } from 'react';
import { MenuItem, MenuCategory } from '@/types';
import { createMenuItem, updateMenuItem } from '@/firebase/services/menuService';
import { getCategories } from '@/firebase/services/categoryService';
import { uploadImage, deleteImage } from '@/firebase/services/storageService';
import { generateSlug } from '@/utils/slug';

interface MenuFormProps {
  item?: MenuItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MenuForm({ item, onSuccess, onCancel }: MenuFormProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: item?.name || '',
    slug: item?.slug || '',
    categoryId: item?.categoryId || '',
    categoryName: item?.categoryName || '',
    description: item?.description || '',
    price: item?.price?.toString() || '',
    imageUrl: item?.imageUrl || '',
    isFavorite: item?.isFavorite || false,
    isAvailable: item?.isAvailable ?? true,
  });

  useEffect(() => {
    getCategories().then((data) => setCategories(data.filter((c) => c.isActive)));
  }, []);

  useEffect(() => {
    if (form.name && !item) {
      setForm((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [form.name, item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'categoryId' ? { categoryName: categories.find((c) => c.id === value)?.name || '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Nama menu wajib diisi');
      return;
    }
    if (!form.categoryId) {
      setError('Kategori wajib dipilih');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        if (item?.imageUrl) {
          await deleteImage(item.imageUrl).catch(console.error);
        }
        imageUrl = await uploadImage(imageFile, `menu/${Date.now()}-${imageFile.name}`);
      }

      const data = {
        name: form.name.trim(),
        slug: form.slug || generateSlug(form.name),
        categoryId: form.categoryId,
        categoryName: form.categoryName,
        description: form.description.trim(),
        price: form.price ? Number(form.price) : null,
        imageUrl,
        isFavorite: form.isFavorite,
        isAvailable: form.isAvailable,
        order: item?.order || 0,
        createdAt: item?.createdAt || new Date() as any,
        updatedAt: new Date() as any,
      };

      if (item) {
        await updateMenuItem(item.id, data);
      } else {
        await createMenuItem(data);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Gagal menyimpan menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">{item ? 'Edit Menu' : 'Tambah Menu'}</h2>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Nama Menu *</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          type="text"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Kategori *</label>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          required
        >
          <option value="">Pilih kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Deskripsi</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Harga</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Kosongkan jika "Hubungi kami""
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Gambar</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full"
        />
        {form.imageUrl && (
          <img src={form.imageUrl} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded" />
        )}
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isFavorite" checked={form.isFavorite} onChange={handleChange} />
          <span className="text-sm">Favorit</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
          <span className="text-sm">Tersedia</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-brown-600 text-white px-6 py-2 rounded-lg hover:bg-brown-700 disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
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
