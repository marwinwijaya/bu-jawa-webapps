import { Link } from 'react-router-dom';
import { MenuItem } from '@/types';
import { formatPrice } from '@/utils/format';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import Badge from '@/components/ui/Badge';

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
        !item.isAvailable ? 'opacity-60' : ''
      }`}
    >
      <Link to={`/menu/${item.slug}`}>
        <div className="relative h-48 bg-gray-200">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {item.isFavorite && <Badge variant="favorit">★ Favorit</Badge>}
            {!item.isAvailable && <Badge variant="habis">Habis</Badge>}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs text-gray-500">{item.categoryName}</span>
        </div>
        <Link to={`/menu/${item.slug}`}>
          <h3 className="font-semibold text-lg text-gray-800 hover:text-brown-600 mb-1">
            {item.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-brown-600">
            {formatPrice(item.price)}
          </span>
          {item.isAvailable && (
            <WhatsAppButton itemName={item.name} price={item.price} />
          )}
        </div>
      </div>
    </div>
  );
}
