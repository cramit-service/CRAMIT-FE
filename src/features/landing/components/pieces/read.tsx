'use client';
// src/features/landing/components/pieces/read.tsx
// 2장 · 슬라이드 옆에, 요약.
import { useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';
import {
  prefersReducedMotion,
  useInView,
} from '@/features/landing/hooks/useInView';
import { Frag } from './Frag';

const PAGES = [
  {
    page: 'P.3',
    title: 'FCFS (First-Come, First-Served)',
    bars: [
      ['P1', 24],
      ['P2', 3],
      ['P3', 3],
    ] as const,
    ticks: ['0', '24', '27', '30'],
    head: 'FCFS',
    lines: [
      <>도착 순서대로, 비선점.</>,
      <>
        긴 작업 뒤에 짧은 작업이 서면 <b>호위 효과</b>. 예시의 평균 대기 시간
        17ms.
      </>,
    ],
  },
  {
    page: 'P.4',
    title: 'SJF (Shortest Job First)',
    bars: [
      ['P2', 3],
      ['P3', 3],
      ['P1', 24],
    ] as const,
    ticks: ['0', '3', '6', '30'],
    head: 'SJF',
    lines: [
      <>실행 시간이 짧은 작업부터.</>,
      <>
        평균 대기 시간이 <b>최소</b>임이 증명돼 있다. 같은 예시에서 3ms.
      </>,
    ],
  },
];

// 슬라이드와 그 페이지의 요약이 같이 넘어간다
export function SplitLead() {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const ref = useInView<HTMLDivElement>((inView) => {
    clearInterval(timer.current);
    if (!inView || prefersReducedMotion()) return;
    timer.current = setInterval(
      () => setIndex((i) => (i + 1) % PAGES.length),
      3200,
    );
  });

  return (
    <div ref={ref} className="flex w-full justify-center">
      <Frag>
        <div className="grid">
          {PAGES.map((p, i) => (
            <div
              key={p.page}
              className={cn(
                'col-start-1 row-start-1 grid grid-cols-2 gap-3.5 transition-opacity',
                i === index
                  ? 'opacity-100 delay-200 duration-300'
                  : 'opacity-0 duration-200',
              )}
            >
              <div className="bg-canvas flex flex-col gap-2.5 rounded-md border border-gray-100 p-3.5">
                <span className="font-mono text-[12px] font-semibold text-gray-500">
                  {p.page}
                </span>
                <b className="text-sky-ink text-[15px] leading-[21px] font-bold">
                  {p.title}
                </b>
                <div className="border-sky-ink/40 flex h-[30px] overflow-hidden rounded-[3px] border font-mono text-[11px] leading-[30px] font-semibold">
                  {p.bars.map(([label, len]) => (
                    <span
                      key={label}
                      className={cn(
                        'border-sky-ink/40 text-sky-ink border-r text-center last:border-r-0',
                        len > 3 ? 'bg-sky-pale' : 'bg-lime-pale',
                      )}
                      style={{ flex: len }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between font-mono text-[10.5px] text-gray-500">
                  {p.ticks.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="px-0.5 py-1">
                <b className="mb-1.5 block font-bold">{p.head}</b>
                <ul className="grid list-disc gap-1 pl-[18px] text-[15px] leading-[23px] text-gray-700 [&_b]:text-gray-800">
                  {p.lines.map((line, j) => (
                    <li key={j}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-md border border-gray-100 text-gray-700">
            <Icon name="arrow-left" size={14} />
          </span>
          <span className="bg-lime-action rounded-full px-3 py-0.5 font-mono text-[13px] leading-[22px] font-semibold">
            {PAGES[index].page} / 6
          </span>
          <span className="grid size-7 place-items-center rounded-md border border-gray-100 text-gray-700">
            <Icon name="arrow-right" size={14} />
          </span>
        </div>
      </Frag>
    </div>
  );
}
