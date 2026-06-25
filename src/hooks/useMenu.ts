import { useState, useEffect } from 'react';
import { MenuItem } from '@/types';
import { getMenuItems } from '@/firebase/services/menuService';

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMenuItems();
      setItems(data);
    } catch (err) {
      setError('Gagal memuat menu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, loading, error, retry: fetchItems };
}
