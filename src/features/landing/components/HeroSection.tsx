'use client';
// src/features/landing/components/HeroSection.tsx
import type { MouseEvent } from 'react';
import Link from 'next/link';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { ArrowUpRightIcon, ScrollIndicatorIcon } from './icons';

export function HeroSection() {
  // 한 화면(뷰포트 높이)만큼 내린다. 히어로가 min-h-screen이라 첫 화면에서 누르면
  // 정확히 다음 섹션 머리에 닿는다. 창이 낮아 히어로가 한 화면을 넘길 때는
  // 한 번 더 눌러 마저 내려갈 수 있다.
  const scrollOnePage = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  // 첫 화면은 아무 데나 눌러도 내려간다. 다만 두 경우는 비켜준다:
  // - 링크·버튼 위 클릭은 그쪽 동작이 우선이다 (CTA는 로그인으로 가야 하고,
  //   아래 Scroll 버튼은 자기 핸들러가 이미 같은 일을 한다 — 여기서 또 처리하면 두 화면이 내려간다)
  // - 글자를 드래그해 선택한 직후의 mouseup도 click으로 잡힌다. 이때 페이지가 튀면 안 된다
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    if (window.getSelection()?.toString()) return;
    scrollOnePage();
  };

  return (
    // -mt-16/pt-16으로 sticky 헤더 뒤까지 그라데이션을 끌어올린다 (헤더 높이 h-16)
    <section
      onClick={handleClick}
      className="relative -mt-16 flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16"
    >
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

      {/* 화면 전체 클릭은 마우스 편의일 뿐이라, 키보드로도 내려갈 수 있게 인디케이터를 버튼으로 둔다.
          보이는 글자가 "Scroll"이라 aria-label로 이름을 덮어쓰지 않는다 */}
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
