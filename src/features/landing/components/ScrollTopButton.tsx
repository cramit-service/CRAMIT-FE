'use client';
// src/features/landing/components/ScrollTopButton.tsx
import { ArrowUpIcon } from './icons';

// 랜딩 우하단에 상시로 떠 있는 "맨 위로" 버튼.
// 원래는 마지막 섹션(FinalCtaSection) 안에 있어서 끝까지 내려가야 보였다 —
// 중간 섹션에서는 위로 돌아갈 방법이 화면에 없었다. fixed로 빼서 어디서든 같은 자리에 둔다.
//
// z-float은 헤더·스플래시보다 아래다. 헤더와는 자리가 겹치지 않지만,
// 첫 진입 스플래시가 걷히기 전에 이 버튼만 위로 튀어나오면 안 된다.
export function ScrollTopButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="맨 위로"
      className="z-float fixed right-8 bottom-8 flex size-11 items-center justify-center rounded-full border border-gray-400 bg-gray-100 text-gray-800 transition-colors hover:bg-gray-200"
    >
      <ArrowUpIcon className="size-4" />
    </button>
  );
}
