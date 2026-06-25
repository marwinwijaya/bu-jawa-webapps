import { useState } from 'react';
import GalleryTable from '@/components/admin/GalleryTable';
import GalleryForm from '@/components/admin/GalleryForm';

export default function GalleryManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Gallery</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-brown-600 text-white px-4 py-2 rounded-lg hover:bg-brown-700"
          >
            + Upload Gambar
          </button>
        )}
      </div>

      {showForm ? (
        <GalleryForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
      ) : (
        <GalleryTable key={refreshKey} />
      )}
    </div>
  );
}
