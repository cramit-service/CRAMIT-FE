'use client';
// src/features/landing/components/ClickToScrollArea.tsx
import { useRef, type MouseEvent, type ReactNode } from 'react';

// 직전 클릭의 smooth 스크롤이 끝났다고 볼 시간. 브라우저 기본 애니메이션은 이보다 짧다.
// 이 시간이 지나면 그 사이 직접 굴렸을 수도 있으니 현재 위치를 다시 믿는다.
const SMOOTH_MS = 1000;

// 랜딩은 아무 데나 눌러도 다음 섹션까지 내려간다.
// 히어로에만 걸면 첫 클릭 이후로는 손이 닿는 곳에 핸들러가 없어 두 번째 클릭이 먹지 않는다.
// 그래서 main 전체가 클릭을 받는다.
export function ClickToScrollArea({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  // 직전 클릭이 "언제, 어디로" 가자고 했는지. 연달아 누를 때의 기준점이 된다.
  const lastRef = useRef({ at: -Infinity, top: 0 });

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    // 링크·버튼 위 클릭은 그쪽 동작이 우선이다 (CTA·헤더 링크는 이동해야 하고,
    // 히어로의 Scroll 버튼은 자기 핸들러가 이미 같은 일을 한다 — 여기서 또 처리하면 두 번 내려간다)
    if ((e.target as HTMLElement).closest('a, button')) return;
    // 글자를 드래그해 선택한 직후의 mouseup도 click으로 잡힌다. 읽으려고 긁었는데 페이지가 튀면 안 된다
    if (window.getSelection()?.toString()) return;

    const main = mainRef.current;
    if (!main) return;

    // 아직 굴러가는 중이면 현재 위치가 아니라 "가려던 곳"을 기준으로 삼는다.
    // 현재 위치를 쓰면 빠르게 두 번 눌렀을 때 중간 지점에 얹혀 한 번치가 안 된다.
    const { at, top: prev } = lastRef.current;
    const base = performance.now() - at < SMOOTH_MS ? prev : window.scrollY;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    // 다음 섹션의 머리. 화면 높이만큼이 아니라 여기까지만 내려야
    // 짧은 섹션을 통째로 지나쳐 읽을 기회를 뺏지 않는다.
    // getBoundingClientRect + scrollY라 스크롤 도중에 재도 문서 기준 좌표로 나온다.
    const nextTop = [...main.children]
      .map((el) => Math.round(el.getBoundingClientRect().top + window.scrollY))
      .find((top) => top > base + 1);

    // 반대로 섹션이 한 화면보다 길면 그 안에서 한 화면씩 나눠 내려간다.
    // 마지막 섹션에 들어섰으면 갈 곳이 없으니 문서 끝까지 간다.
    const top = Math.min(nextTop ?? max, base + window.innerHeight, max);

    lastRef.current = { at: performance.now(), top };
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <main ref={mainRef} onClick={handleClick}>
      {children}
    </main>
  );
}
