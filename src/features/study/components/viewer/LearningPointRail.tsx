'use client';
// src/features/study/components/viewer/LearningPointRail.tsx
import { useEffect, useMemo, useState } from 'react';
import { listLearningPoints } from '@/features/study/lib/learningPoints';
import { cn } from '@/shared/lib/cn';

// 요약 오른쪽의 학습포인트 레일. 노션 목차처럼 평소엔 짧은 선만 있고,
// 마우스를 올리거나 키보드로 들어오면 고른 글 목록이 펼쳐진다.
// 선은 순서만 말한다 — 요약 안의 실제 위치 비율로 흩으면 요약 길이마다 레일이 달라진다.
export function LearningPointRail({
  markdown,
  scrollRef,
}: {
  markdown: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const points = useMemo(() => listLearningPoints(markdown), [markdown]);
  const [active, setActive] = useState<number | null>(null);

  // 지금 보고 있는 학습포인트: 화면 위쪽 1/3 선을 지난 마지막 하이라이트
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const update = () => {
      const top = root.getBoundingClientRect().top + root.clientHeight / 3;
      let current: number | null = null;
      for (const point of points) {
        const el = document.getElementById(`lp-${point.offset}`);
        if (el && el.getBoundingClientRect().top <= top) current = point.offset;
      }
      setActive(current ?? points[0]?.offset ?? null);
    };
    root.addEventListener('scroll', update, { passive: true });
    return () => root.removeEventListener('scroll', update);
  }, [points, scrollRef]);

  if (points.length === 0) return null;

  const current = active ?? points[0].offset;

  const jump = (e: React.MouseEvent, offset: number) => {
    e.preventDefault();
    document
      .getElementById(`lp-${offset}`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  return (
    <nav aria-label="학습포인트" className="group absolute top-4 right-3 z-10">
      <ol className="flex flex-col items-end gap-3 px-1 py-2 group-focus-within:invisible group-hover:invisible">
        {points.map((point) => (
          <li key={point.offset}>
            <a
              href={`#lp-${point.offset}`}
              tabIndex={-1}
              aria-hidden
              onClick={(e) => jump(e, point.offset)}
              className={cn(
                'block h-0.5 w-5 rounded-full',
                point.offset === current ? 'bg-gray-800' : 'bg-gray-200',
              )}
            />
          </li>
        ))}
      </ol>
      <ol className="bg-surface shadow-far absolute top-0 right-0 hidden w-72 flex-col gap-0.5 rounded-md border border-gray-100 p-2 group-focus-within:flex group-hover:flex">
        {points.map((point) => (
          <li key={point.offset}>
            <a
              href={`#lp-${point.offset}`}
              onClick={(e) => jump(e, point.offset)}
              aria-current={point.offset === current ? 'location' : undefined}
              className={cn(
                'text-label line-clamp-2 rounded-md px-3 py-1.5 hover:bg-gray-100',
                point.offset === current ? 'text-sky-ink' : 'text-gray-700',
              )}
            >
              {point.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
