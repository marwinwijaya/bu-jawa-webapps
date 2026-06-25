import { type ReactNode } from 'react';

type BadgeVariant = 'favorit' | 'habis' | 'available';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  favorit: 'bg-brown/10 text-brown border-brown/20',
  habis: 'bg-red-bata/10 text-red-bata border-red-bata/20',
  available: 'bg-green-leaf/10 text-green-leaf border-green-leaf/20',
};

export default function Badge({
  variant = 'available',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
