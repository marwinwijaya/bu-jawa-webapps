interface SectionTitleProps {
  kicker?: string;
  title: string;
  description?: string;
  className?: string;
}

export default function SectionTitle({
  kicker,
  title,
  description,
  className = '',
}: SectionTitleProps) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {kicker && (
        <p className="text-sm font-semibold uppercase tracking-wider text-green-leaf mb-1">
          {kicker}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold text-brown-dark">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-base text-brown-light max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
