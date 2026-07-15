'use client';
// src/shared/ui/Button.tsx
import { cn } from '@/shared/lib/cn';

type Variant = 'primary' | 'danger' | 'point' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// variant별 색상 스타일
const variantStyles: Record<Variant, string> = {
  primary: 'bg-secondary-400 text-gray-900 hover:bg-secondary-500',
  danger: 'bg-error text-white hover:opacity-90',
  point: 'bg-primary-400 text-gray-900 hover:bg-primary-500',
  outline: 'bg-white text-gray-900 border border-gray-400 hover:bg-gray-200',
};

// size별 크기 스타일
const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors',
        sizeStyles[size],
        // 비활성이면 회색만, 아니면 variant 색상 적용
        disabled
          ? 'cursor-not-allowed bg-gray-400 text-gray-600'
          : variantStyles[variant],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}