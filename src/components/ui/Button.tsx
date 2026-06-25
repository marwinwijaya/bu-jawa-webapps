import { type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'whatsapp' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  href?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brown text-white hover:bg-brown-dark active:bg-brown-dark/90 shadow-sm',
  outline:
    'border-2 border-brown text-brown hover:bg-brown hover:text-white active:bg-brown-dark',
  whatsapp:
    'bg-green-leaf text-white hover:bg-green-leaf-dark active:bg-green-leaf-dark/90 shadow-sm',
  danger:
    'bg-red-bata text-white hover:bg-red-bata-dark active:bg-red-bata-dark/90 shadow-sm',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  href,
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brown/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href && !disabled) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
