import { useState, useCallback } from 'react';
import { useMenu } from '@/hooks/useMenu';
import { useCategories } from '@/hooks/useCategories';
import MenuFilter from '@/components/menu/MenuFilter';
import MenuSearch from '@/components/menu/MenuSearch';
import MenuGrid from '@/components/menu/MenuGrid';
import SectionTitle from '@/components/ui/SectionTitle';

export default function MenuPage() {
  const { items, loading, error, retry } = useMenu();
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Filter logic: AND (category AND search)
  const filteredItems = items.filter((item) => {
    // Category filter
    if (selectedCategory && item.categoryId !== selectedCategory) {
      return false;
    }
    // Search filter (case-insensitive on name only)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return item.name.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <SectionTitle
          kicker="Menu Kami"
          title="Pilihan Hidangan Lezat"
          description="Pilih menu favorit Anda dan pesan langsung via WhatsApp"
        />

        <div className="mb-6 space-y-4">
          <MenuSearch value={searchQuery} onChange={handleSearch} />
          <MenuFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        <MenuGrid
          items={filteredItems}
          loading={loading}
          error={error}
          onRetry={retry}
          searchQuery={searchQuery}
        />
      </div>
    </section>
  );
}
