'use client';
// src/features/landing/components/FeatureTour.tsx
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { useReducedMotion } from '@/features/landing/hooks/useInView';
import { Motion } from './Motion';
import { Shot } from './pieces/Shot';
import styles from './motion.module.css';

export interface TourStep {
  title: string;
  body: string;
  /** public/landing/cards/{shot}-a·b.webp */
  shot: string;
}

const FRAME_SIZES = '(min-width: 1024px) 680px, 100vw';

// 한 장 안의 기능을 스크롤하며 하나씩 본다. 넓은 화면에선 오른쪽 화면이 고정되고,
// 지금 읽는 설명의 실제 화면(전 → 후)으로 바뀐다. 좁으면 설명 아래에 화면이 붙는다.
export function FeatureTour({ steps }: { steps: TourStep[] }) {
  const [active, setActive] = useState(0);
  const motion = !useReducedMotion();
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // 화면 세로 가운데 띠에 들어온 설명을 지금 단계로 본다
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.index));
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    stepRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-10 grid gap-x-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div>
        {steps.map((step, i) => (
          <div
            key={step.shot}
            ref={(node) => {
              stepRefs.current[i] = node;
            }}
            data-index={i}
            className="flex flex-col justify-center gap-3 py-10 lg:min-h-[64vh] lg:py-0"
          >
            <h3
              className={cn(
                'text-heading-sm font-bold text-gray-800 transition-opacity duration-300',
                active === i ? 'lg:opacity-100' : 'lg:opacity-30',
              )}
            >
              {step.title}
            </h3>
            <p
              className={cn(
                'text-body text-gray-500 transition-opacity duration-300',
                active === i ? 'lg:opacity-100' : 'lg:opacity-40',
              )}
            >
              {step.body}
            </p>
            {/* 좁은 화면: 설명 바로 아래에 그 화면 */}
            <Motion className="mt-4 lg:hidden">
              <div
                aria-hidden
                className="bg-canvas shadow-far relative aspect-[1.85/1] overflow-hidden rounded-md border border-gray-100"
              >
                <Shot name={step.shot} sizes={FRAME_SIZES} />
              </div>
            </Motion>
          </div>
        ))}
      </div>

      {/* 넓은 화면: 고정된 화면 하나에서 단계마다 바뀐다. 같은 내용을 옆 설명이 글로 말한다 */}
      <div
        aria-hidden
        className="sticky top-[calc(50vh-12rem)] hidden self-start lg:block"
      >
        <div className="bg-canvas shadow-far relative aspect-[1.85/1] overflow-hidden rounded-md border border-gray-100">
          {steps.map((step, i) => (
            <div
              key={step.shot}
              // 지금 단계만 전 → 후를 돌린다. 속성이 붙는 순간 처음부터 다시 돈다
              data-motion={motion && active === i ? 'play' : undefined}
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                styles.root,
                active === i ? 'opacity-100' : 'opacity-0',
              )}
            >
              <Shot name={step.shot} sizes={FRAME_SIZES} />
            </div>
          ))}
        </div>
        <ol className="mt-4 flex justify-center gap-2">
          {steps.map((step, i) => (
            <li
              key={step.shot}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                active === i ? 'w-6 bg-gray-800' : 'w-1.5 bg-gray-200',
              )}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}
