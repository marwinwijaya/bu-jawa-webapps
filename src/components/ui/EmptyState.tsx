import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 text-brown-light/50 text-5xl">{icon}</div>
      )}
      <h3 className="text-lg sm:text-xl font-semibold text-brown-dark mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-brown-light max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
