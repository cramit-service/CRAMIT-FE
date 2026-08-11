'use client';
// src/features/landing/components/ClickToScrollArea.tsx
import { useRef, type MouseEvent, type ReactNode } from 'react';

// 직전 클릭의 smooth 스크롤이 끝났다고 볼 시간. 브라우저 기본 애니메이션은 이보다 짧다.
// 이 시간이 지나면 그 사이 직접 굴렸을 수도 있으니 현재 위치를 다시 믿는다.
const SMOOTH_MS = 1000;

// 랜딩은 아무 데나 눌러도 한 화면씩 내려간다.
// 히어로에만 걸면 첫 클릭 이후로는 손이 닿는 곳에 핸들러가 없어 두 번째 클릭이 먹지 않는다.
// 그래서 main 전체가 클릭을 받는다.
export function ClickToScrollArea({ children }: { children: ReactNode }) {
  // 직전 클릭이 "언제, 어디로" 가자고 했는지. 연달아 누를 때의 기준점이 된다.
  const lastRef = useRef({ at: -Infinity, top: 0 });

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    // 링크·버튼 위 클릭은 그쪽 동작이 우선이다 (CTA는 로그인으로 가야 하고,
    // 히어로의 Scroll 버튼은 자기 핸들러가 이미 같은 일을 한다 — 여기서 또 처리하면 두 화면이 내려간다)
    if ((e.target as HTMLElement).closest('a, button')) return;
    // 글자를 드래그해 선택한 직후의 mouseup도 click으로 잡힌다. 읽으려고 긁었는데 페이지가 튀면 안 된다
    if (window.getSelection()?.toString()) return;

    // 아직 굴러가는 중이면 현재 위치가 아니라 "가려던 곳"에 한 화면을 더한다.
    // 현재 위치로 더하면 빠르게 두 번 눌렀을 때 중간 지점에 얹혀 한 화면이 안 된다.
    const { at, top: prev } = lastRef.current;
    const base = performance.now() - at < SMOOTH_MS ? prev : window.scrollY;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const top = Math.min(base + window.innerHeight, max);

    lastRef.current = { at: performance.now(), top };
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return <main onClick={handleClick}>{children}</main>;
}
