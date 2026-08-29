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
      {/* 시안(1:4986 Top)에는 가운데 로고뿐이고 로그인·회원가입 버튼이 없어 맞출 값이 없다.
          그래서 화면 우측 끝에 붙은 유일한 다른 요소인 ScrollTopButton(right-8)에 맞춰 px-8로 둔다.
          예전엔 본문과 같은 max-w-6xl 안에 있어 넓은 화면에서 우측에 크게 떠 있었다.
          폭을 풀어도 로고는 left-1/2이라 화면 정중앙 그대로다(시안 960/1920). */}
      <div className="relative flex h-16 items-center justify-between px-8 sm:justify-end">
        {/* 로고를 화면 정중앙에 고정하면 좁은 폭에서 우측 메뉴와 겹친다(390px에서 34px 겹침).
            sm 미만에서는 absolute를 풀어 좌측에 흐름대로 두고 justify-between으로 벌린다. */}
        <Link
          href="/"
          className="sm:absolute sm:left-1/2 sm:-translate-x-1/2"
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
