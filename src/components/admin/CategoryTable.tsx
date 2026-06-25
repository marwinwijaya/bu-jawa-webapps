import { useState, useEffect } from 'react';
import { MenuCategory } from '@/types';
import { getCategories, deleteCategory } from '@/firebase/services/categoryService';

interface CategoryTableProps {
  onEdit: (category: MenuCategory) => void;
}

export default function CategoryTable({ onEdit }: CategoryTableProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menonaktifkan kategori ini? Menu di kategori ini tidak akan dihapus.')) return;
    try {
      setDeleting(id);
      await deleteCategory(id);
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, isActive: false } : c));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus kategori');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Slug</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Urutan</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {categories.map((cat) => (
            <tr key={cat.id} className={!cat.isActive ? 'bg-gray-50' : ''}>
              <td className="px-4 py-3 font-medium">{cat.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{cat.slug}</td>
              <td className="px-4 py-3 text-sm">{cat.order}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {cat.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button onClick={() => onEdit(cat)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  {cat.isActive && (
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deleting === cat.id}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      {deleting === cat.id ? 'Menghapus...' : 'Nonaktifkan'}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {categories.length === 0 && (
        <div className="p-8 text-center text-gray-500">Belum ada kategori</div>
      )}
    </div>
  );
}
