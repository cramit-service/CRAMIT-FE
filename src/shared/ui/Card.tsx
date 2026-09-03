// src/shared/ui/Card.tsx
'use client';

import { cn } from '@/shared/lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  clickable?: boolean;
}

export function Card({
  clickable = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-300 bg-white p-4',
        clickable && 'cursor-pointer transition-shadow hover:shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
