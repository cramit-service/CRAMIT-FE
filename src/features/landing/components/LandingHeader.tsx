'use client';
// src/features/landing/components/LandingHeader.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Logo } from '@/shared/ui/Logo';

export function LandingHeader() {
  // 맨 위에서는 바탕을 비우고, 스크롤이 시작되면 반투명 바탕을 깔아 아래 노트북 위에서도 로고가 읽히게 한다
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'z-header sticky top-0 transition-colors',
        scrolled ? 'bg-canvas/80 backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
        <Link href="/" aria-label="크래밋 홈" className="text-gray-800">
          <Logo height={20} />
        </Link>
        {/* 소셜 로그인만 있어 가입도 같은 /login으로 간다 */}
        <nav className="flex items-center gap-5">
          <Link
            href="/login"
            className="text-label font-medium text-gray-700 hover:text-gray-800"
          >
            로그인
          </Link>
          <Button href="/login" size="sm">
            시작하기
          </Button>
        </nav>
      </div>
    </header>
  );
}
