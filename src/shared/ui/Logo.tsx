'use client';
// src/shared/ui/Logo.tsx
import { cn } from '@/shared/lib/cn';

interface LogoProps {
  // 크기는 폰트 크기로 조절한다 (예: text-xl, text-6xl)
  className?: string;
}

// CRAMIT 워드마크. 마침표만 시그니처 연두색으로 강조한다.
export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        'font-extrabold tracking-tight text-gray-950 select-none',
        className,
      )}
    >
      CRAMIT<span className="text-primary-400">.</span>
    </span>
  );
}
