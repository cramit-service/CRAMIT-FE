'use client';
// src/features/landing/components/LandingSplash.tsx
import { useEffect, useRef } from 'react';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { Logo } from '@/shared/ui/Logo';
import { SPLASH_SEEN_KEY } from '@/features/landing/lib/splashScript';

// 건너뛸 때 남은 재생을 당기는 배수. 4.2초짜리라 10배면 어디서 눌러도 0.5초 안에 걷힌다.
const SKIP_PLAYBACK_RATE = 10;

// 랜딩 진입 스플래시 (Figma "메인화면").
// 워드마크는 헤더와 같은 자리에 두어 사라질 때 제자리에 남은 것처럼 보이게 하고,
// 큰 제목만 배경과 함께 걷힌다. 사라지는 동작은 CSS 애니메이션이라 상태가 필요 없다.
//
// 이미 본 세션이면 <html data-splash="seen">가 찍혀 있어 CSS가 이 오버레이를 숨긴다
// (globals.css). 그 판정은 루트 레이아웃의 head 스크립트가 첫 페인트 전에 끝낸다.
export function LandingSplash() {
  const overlayRef = useRef<HTMLDivElement>(null);

  // "봤음" 기록은 여기서 남긴다 — 랜딩을 실제로 연 경우에만 찍혀야 하기 때문이다.
  // 이번 방문은 이미 보여주기로 결정됐으므로 마운트 후에 써도 늦지 않다.
  useEffect(() => {
    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    } catch {
      // 프라이빗 모드 등에서 sessionStorage가 막히면 매번 스플래시를 보여준다
    }
  }, []);

  // 4.2초는 처음 보기에 적당해도 기다리는 사람에겐 길다.
  // 스크롤·클릭처럼 "넘어가고 싶다"는 신호가 오면 남은 재생을 당겨 바로 걷는다.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    // 이미 본 세션이면 CSS가 display:none으로 지운 상태다 — 건드릴 게 없다.
    if (document.documentElement.dataset.splash === 'seen') return;

    let cleanup = () => {};

    const skip = () => {
      cleanup();
      // 클래스를 갈아끼우면 opacity가 1로 되돌아가 한 번 번쩍인다.
      // 지금 진행 중인 애니메이션의 속도만 올려 이어서 걷히게 한다.
      const running = overlay.getAnimations?.() ?? [];
      if (running.length === 0) {
        // getAnimations를 모르는 브라우저 대비. 이미 본 세션과 같은 경로로 지운다.
        document.documentElement.dataset.splash = 'seen';
        return;
      }
      running.forEach((animation) => {
        animation.playbackRate = SKIP_PLAYBACK_RATE;
      });
    };

    // 불러오는 도중 브라우저가 복원하는 scroll 한 발에 곧장 걷히지 않도록
    // 한 프레임 뒤에 듣기 시작한다.
    const frame = requestAnimationFrame(() => {
      // wheel·touchmove는 문서가 더 스크롤될 수 없어 scroll이 안 뜨는 경우까지 받는다.
      const events = [
        'pointerdown',
        'keydown',
        'wheel',
        'touchmove',
        'scroll',
      ] as const;
      events.forEach((type) =>
        window.addEventListener(type, skip, { passive: true }),
      );
      cleanup = () =>
        events.forEach((type) => window.removeEventListener(type, skip));
    });

    return () => {
      cancelAnimationFrame(frame);
      cleanup();
    };
  }, []);

  return (
    <div
      ref={overlayRef}
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
