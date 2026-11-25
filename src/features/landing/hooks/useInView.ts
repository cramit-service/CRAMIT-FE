'use client';
// src/features/landing/hooks/useInView.ts
import { useEffect, useRef, useSyncExternalStore } from 'react';

const REDUCE = '(prefers-reduced-motion: reduce)';

/** 움직임 줄이기 설정이면 랜딩의 장식 움직임을 아예 켜지 않는다. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCE).matches;
}

/** 렌더 중에 쓰는 판. 서버에선 줄인 쪽으로 그려서 하이드레이션 뒤에만 움직임이 붙는다. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCE);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(REDUCE).matches,
    () => true,
  );
}

/** 요소가 화면에 들어오고 나갈 때 알린다. 콜백이 바뀌어도 관찰은 다시 걸지 않는다. */
export function useInView<T extends HTMLElement>(
  onChange: (inView: boolean) => void,
  threshold = 0.25,
) {
  const ref = useRef<T>(null);
  const callback = useRef(onChange);

  useEffect(() => {
    callback.current = onChange;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => callback.current(entry.isIntersecting),
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
