'use client';
// src/features/landing/components/LandingHeader.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { Logo } from '@/shared/ui/Logo';

export function LandingHeader() {
  // 히어로 위에서는 배경을 비워 그라데이션을 그대로 보여주고,
  // 스크롤이 시작되면 배경을 깔아 어두운 섹션 위에서도 로고가 읽히게 한다.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll(); // 새로고침으로 중간부터 보는 경우 대비
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors',
        scrolled ? 'bg-primary-100/80 backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-end px-6">
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2"
          aria-label="크래밋 홈"
        >
          {/* Figma 헤더 워드마크는 110x22 */}
          <Logo className="h-[22px] text-gray-950" />
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-900 transition-colors hover:text-gray-600"
          >
            로그인
          </Link>
          {/* 소셜 로그인만 있어 회원가입도 같은 /login으로 보낸다 */}
          <Link
            href="/login"
            className="bg-secondary-400 hover:bg-secondary-500 rounded-full px-4 py-2 text-sm font-medium text-gray-900 transition-colors"
          >
            회원가입
          </Link>
        </nav>
      </div>
    </header>
  );
}
