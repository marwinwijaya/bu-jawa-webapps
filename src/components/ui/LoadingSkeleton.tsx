interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({
  count = 3,
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl bg-cream-dark p-4 sm:p-6"
        >
          <div className="h-4 bg-brown/10 rounded w-3/4 mb-3" />
          <div className="h-3 bg-brown/10 rounded w-1/2 mb-2" />
          <div className="h-3 bg-brown/10 rounded w-5/6" />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
