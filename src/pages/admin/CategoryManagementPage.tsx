import { useState } from 'react';
import { MenuCategory } from '@/types';
import CategoryTable from '@/components/admin/CategoryTable';
import CategoryForm from '@/components/admin/CategoryForm';

export default function CategoryManagementPage() {
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingCategory(null);
    setRefreshKey((k) => k + 1);
  };

  const handleEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Kategori</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-brown-600 text-white px-4 py-2 rounded-lg hover:bg-brown-700"
          >
            + Tambah Kategori
          </button>
        )}
      </div>

      {showForm ? (
        <CategoryForm category={editingCategory} onSuccess={handleSuccess} onCancel={handleCancel} />
      ) : (
        <CategoryTable key={refreshKey} onEdit={handleEdit} />
      )}
    </div>
  );
}
