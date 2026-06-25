import { MenuItem } from '@/types';
import MenuCard from './MenuCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

interface MenuGridProps {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  searchQuery?: string;
}

export default function MenuGrid({ items, loading, error, onRetry, searchQuery }: MenuGridProps) {
  if (loading) {
    return <LoadingSkeleton count={6} />;
  }

  if (error) {
    return <ErrorState title="Gagal Memuat Menu" description={error} onRetry={onRetry} />;
  }

  if (items.length === 0) {
    if (searchQuery && searchQuery.trim()) {
      return (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="Menu tidak ditemukan"
          description={`Tidak ada menu yang cocok dengan "${searchQuery}"`}
        />
      );
    }
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
        title="Menu belum tersedia"
        description="Menu belum tersedia saat ini. Silakan hubungi kami via WhatsApp untuk pemesanan."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <MenuCard key={item.id} item={item} />
      ))}
    </div>
  );
}
