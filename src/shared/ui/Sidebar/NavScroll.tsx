'use client';
// src/shared/ui/Sidebar/NavScroll.tsx
// 스크롤바가 자리를 안 먹는 스크롤 영역. 막대는 스크롤하는 동안만 뜬다.
// 남는 높이를 전부 가져간다(min-h-0 + flex-1) — 몇 줄까지 보일지는 창이 정한다.
//
// 네이티브 스크롤바를 그냥 숨겼다 띄우는 걸로는 안 된다 — Blink에서 클래식 스크롤바는
// 켜지는 순간 6px을 레이아웃에서 가져가므로, 스크롤할 때마다 레일 내용이 밀린다.
// 레일에서는 그 6px이 곧 연두 필의 좌우 비대칭이었다(좌 8 / 우 14).
// 그래서 네이티브는 레이아웃에서 완전히 빼고, 막대는 absolute로 얹는다.
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';

// 스크롤이 멈추고 막대가 사라지기까지. 짧으면 한 번 굴릴 때마다 깜빡인다.
const LINGER_MS = 700;
// 내용이 아주 길어도 집어서 끌 수 있을 만한 최소 길이
const MIN_THUMB = 24;

interface NavScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function NavScroll({ children, className, ...props }: NavScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const [thumb, setThumb] = useState<{ top: number; height: number } | null>(
    null,
  );
  const [active, setActive] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    // 넘치지 않으면 막대 자체가 없다
    if (scrollHeight <= clientHeight + 1) {
      setThumb(null);
      return;
    }
    const height = Math.max(
      MIN_THUMB,
      (clientHeight / scrollHeight) * clientHeight,
    );
    const top =
      (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - height);
    setThumb({ top, height });
  }, []);

  const handleScroll = useCallback(() => {
    measure();
    setActive(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(false), LINGER_MS);
  }, [measure]);

  // 창 크기·목록 길이가 바뀌면 막대 길이도 바뀐다. 보이지 않는 동안에도 재어 둬야
  // 다음에 뜰 때 옛 길이로 한 프레임 깜빡이지 않는다.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of el.children) ro.observe(child);
    return () => ro.disconnect();
  }, [measure, children]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={ref}
        onScroll={handleScroll}
        className={cn(
          'scrollbar-hidden fade-bottom min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain',
          className,
        )}
        {...props}
      >
        {children}
      </div>
      {thumb && (
        <span
          aria-hidden
          style={{ top: thumb.top, height: thumb.height }}
          className={cn(
            'pointer-events-none absolute right-1 w-1 rounded-full bg-gray-300 transition-opacity duration-200 ease-out',
            active ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  );
}
