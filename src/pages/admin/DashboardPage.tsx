import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMenuItems } from '@/firebase/services/menuService';
import { getCategories } from '@/firebase/services/categoryService';
import { getGalleryImages } from '@/firebase/services/galleryService';

export default function DashboardPage() {
  const [stats, setStats] = useState({ menu: 0, categories: 0, gallery: 0, available: 0, unavailable: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [menuItems, categories, gallery] = await Promise.all([
          getMenuItems(),
          getCategories(),
          getGalleryImages(),
        ]);
        setStats({
          menu: menuItems.length,
          categories: categories.length,
          gallery: gallery.length,
          available: menuItems.filter((i) => i.isAvailable).length,
          unavailable: menuItems.filter((i) => !i.isAvailable).length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const cards = [
    { label: 'Total Menu', value: stats.menu, link: '/admin/menu', color: 'bg-blue-500' },
    { label: 'Menu Tersedia', value: stats.available, link: '/admin/menu', color: 'bg-green-500' },
    { label: 'Menu Habis', value: stats.unavailable, link: '/admin/menu', color: 'bg-red-500' },
    { label: 'Kategori', value: stats.categories, link: '/admin/categories', color: 'bg-purple-500' },
    { label: 'Gallery', value: stats.gallery, link: '/admin/gallery', color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
              <span className="text-white text-xl font-bold">{card.value}</span>
            </div>
            <h3 className="font-semibold text-gray-800">{card.label}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
