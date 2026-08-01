'use client';
// src/features/landing/components/LandingSplash.tsx
import { useEffect } from 'react';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { Logo } from '@/shared/ui/Logo';
import { SPLASH_SEEN_KEY } from '../lib/splashScript';

// 랜딩 진입 스플래시 (Figma "메인화면").
// 워드마크는 헤더와 같은 자리에 두어 사라질 때 제자리에 남은 것처럼 보이게 하고,
// 큰 제목만 배경과 함께 걷힌다. 사라지는 동작은 CSS 애니메이션이라 상태가 필요 없다.
//
// 이미 본 세션이면 <html data-splash="seen">가 찍혀 있어 CSS가 이 오버레이를 숨긴다
// (globals.css). 그 판정은 루트 레이아웃의 head 스크립트가 첫 페인트 전에 끝낸다.
export function LandingSplash() {
  // "봤음" 기록은 여기서 남긴다 — 랜딩을 실제로 연 경우에만 찍혀야 하기 때문이다.
  // 이번 방문은 이미 보여주기로 결정됐으므로 마운트 후에 써도 늦지 않다.
  useEffect(() => {
    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    } catch {
      // 프라이빗 모드 등에서 sessionStorage가 막히면 매번 스플래시를 보여준다
    }
  }, []);

  return (
    <div
      data-splash-overlay
      aria-hidden
      className="animate-splash-out fixed inset-0 z-100"
    >
      <GradientBackground layer />

      {/* 헤더 로고와 같은 높이(h-16 헤더의 세로 중앙)에 맞춰 자리를 겹친다 */}
      <div className="relative flex h-16 items-center justify-center">
        <Logo className="h-[22px] text-gray-950" />
      </div>

      {/* Figma: 150px / Medium / leading 184 / tracking -3px.
            1920 기준 7.8vw라 vw로 두면 어느 폭에서도 시안 비율이 유지된다 */}
      <div className="relative flex h-[calc(100%-4rem)] items-center justify-center px-6">
        <p className="text-center text-[clamp(2.25rem,7.8vw,150px)] leading-[1.23] font-medium tracking-[-0.02em] text-gray-950">
          나만의 학습 어시스턴트
        </p>
      </div>
    </div>
  );
}
