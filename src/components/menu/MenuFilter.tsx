import { MenuCategory } from '@/types';

interface MenuFilterProps {
  categories: MenuCategory[];
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
}

export default function MenuFilter({ categories, selectedCategory, onSelect }: MenuFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedCategory === null
            ? 'bg-brown-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === cat.id
              ? 'bg-brown-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
