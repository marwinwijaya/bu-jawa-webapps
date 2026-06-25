import { useState } from 'react';
import { MenuCategory } from '@/types';
import { createCategory, updateCategory } from '@/firebase/services/categoryService';
import { generateSlug } from '@/utils/slug';

interface CategoryFormProps {
  category?: MenuCategory | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    order: category?.order?.toString() || '0',
    isActive: category?.isActive ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && !category ? { slug: generateSlug(value) } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Nama kategori wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = {
        name: form.name.trim(),
        slug: form.slug || generateSlug(form.name),
        order: Number(form.order) || 0,
        isActive: form.isActive,
        createdAt: category?.createdAt || new Date() as any,
        updatedAt: new Date() as any,
      };

      if (category) {
        await updateCategory(category.id, data);
      } else {
        await createCategory(data);
      }
      onSuccess();
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        setError('Kategori sudah ada');
      } else {
        setError('Gagal menyimpan kategori');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">{category ? 'Edit Kategori' : 'Tambah Kategori'}</h2>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Nama Kategori *</label>
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
        <label className="block text-sm font-medium mb-1">Urutan</label>
        <input
          type="number"
          name="order"
          value={form.order}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
        <span className="text-sm">Aktif</span>
      </label>

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
