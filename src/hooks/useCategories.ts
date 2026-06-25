import { useState, useEffect } from 'react';
import { MenuCategory } from '@/types';
import { getCategories } from '@/firebase/services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.filter((c) => c.isActive));
      } catch (err) {
        console.error('Gagal memuat kategori:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return { categories, loading };
}
