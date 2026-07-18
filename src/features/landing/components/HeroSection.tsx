// src/features/landing/components/HeroSection.tsx
import Link from 'next/link';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { ArrowUpRightIcon, ScrollIndicatorIcon } from './icons';

export function HeroSection() {
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

      <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-gray-600">
        <ScrollIndicatorIcon className="h-6 w-4" />
        <span className="text-xs font-medium tracking-wide">Scroll</span>
      </div>
    </section>
  );
}
