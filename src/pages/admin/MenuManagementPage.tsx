import { useState } from 'react';
import { MenuItem } from '@/types';
import MenuTable from '@/components/admin/MenuTable';
import MenuForm from '@/components/admin/MenuForm';

export default function MenuManagementPage() {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
    setRefreshKey((k) => k + 1);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Menu</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-brown-600 text-white px-4 py-2 rounded-lg hover:bg-brown-700"
          >
            + Tambah Menu
          </button>
        )}
      </div>

      {showForm ? (
        <MenuForm item={editingItem} onSuccess={handleSuccess} onCancel={handleCancel} />
      ) : (
        <MenuTable key={refreshKey} onEdit={handleEdit} />
      )}
    </div>
  );
}
