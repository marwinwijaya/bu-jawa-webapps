import { useState, useEffect } from 'react';
import { MenuItem } from '@/types';
import { getMenuItems, deleteMenuItem } from '@/firebase/services/menuService';
import { formatPrice } from '@/utils/format';

interface MenuTableProps {
  onEdit: (item: MenuItem) => void;
}

export default function MenuTable({ onEdit }: MenuTableProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus menu ini?')) return;
    try {
      setDeleting(id);
      await deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus menu');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gambar</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kategori</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Harga</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className={!item.isAvailable ? 'bg-gray-50' : ''}>
                <td className="px-4 py-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                      No img
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{item.name}</div>
                  {item.isFavorite && <span className="text-xs text-yellow-600">★ Favorit</span>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.categoryName}</td>
                <td className="px-4 py-3 text-sm">{formatPrice(item.price)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.isAvailable ? 'Tersedia' : 'Habis'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      {deleting === item.id ? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <div className="p-8 text-center text-gray-500">Belum ada menu</div>
      )}
    </div>
  );
}
