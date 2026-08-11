'use client';
// src/features/landing/components/HeroSection.tsx
import Link from 'next/link';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { ArrowUpRightIcon, ScrollIndicatorIcon } from './icons';

export function HeroSection() {
  // 화면 아무 데나 누르면 내려가는 동작은 ClickToScrollArea(main)가 맡는다.
  // 여기 Scroll 버튼은 키보드로도 같은 일을 하기 위한 것이다.
  const scrollOnePage = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    // -mt-16/pt-16으로 sticky 헤더 뒤까지 그라데이션을 끌어올린다 (헤더 높이 h-16)
    <section className="relative -mt-16 flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
      <GradientBackground layer />

      <div className="relative text-center">
        <h1 className="text-lg font-bold text-balance text-gray-900 md:text-2xl">
          막막한 학습의 순간, 내 곁에 함께하는 AI 학습 어시스턴트
        </h1>

        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-100 transition-colors hover:bg-gray-900"
        >
          크래밋 시작하기
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* 보이는 글자가 "Scroll"이라 aria-label로 이름을 덮어쓰지 않는다 */}
      <button
        type="button"
        onClick={scrollOnePage}
        className="absolute bottom-16 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
      >
        <ScrollIndicatorIcon className="h-6 w-4" />
        <span className="text-xs font-medium tracking-wide">Scroll</span>
      </button>
    </section>
  );
}
