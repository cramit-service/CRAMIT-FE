// src/shared/ui/Input.tsx
'use client';
import { cn } from '@/shared/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  id,
  disabled,
  ...props
}: InputProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        id={id}
        disabled={disabled}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-base transition-colors',
          'placeholder:text-gray-400 focus:outline-none',
          error
            ? 'border-error focus:border-error'
            : 'focus:border-secondary-400 border-gray-400',
          disabled && 'cursor-not-allowed bg-gray-200 text-gray-500',
          className,
        )}
        {...props}
      />

      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );
}
