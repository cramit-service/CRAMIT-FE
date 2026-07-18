'use client';
// src/shared/ui/Logo.tsx
import Image from 'next/image';
import { cn } from '@/shared/lib/cn';

type LogoVariant = 'wordmark' | 'symbol';

interface LogoProps {
  // 'wordmark'(기본): CRAMIT. 워드마크 / 'symbol': 어두운 배경용 심볼 마크
  variant?: LogoVariant;
  // 크기: 워드마크는 폰트 크기(text-xl 등), 심볼은 기본 크기를 쓰거나 className으로 조절
  className?: string;
}

// CRAMIT 심볼 마크. 실제 로고 에셋(public/logo-symbol.png)을 그대로 사용한다.
// 연두·하늘 두 알약이 겹치는 반투명 표현이 원본 디자인이라 이미지로 넣는다.
function SymbolMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-symbol.png"
      alt="CRAMIT"
      width={34}
      height={48}
      priority
      className={cn('h-11 w-auto select-none', className)}
    />
  );
}

// CRAMIT 로고. 기본은 워드마크(마침표만 시그니처 연두), symbol은 심볼 마크.
export function Logo({ variant = 'wordmark', className }: LogoProps) {
  if (variant === 'symbol') {
    return <SymbolMark className={className} />;
  }

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
