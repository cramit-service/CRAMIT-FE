'use client';
// src/features/landing/components/StorySection.tsx
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/lib/cn';
import { LaptopFrame } from '@/features/landing/components/LaptopFrame';

interface Beat {
  title: string[];
  body: string;
  screen: string;
  // 화면이 바뀐 뒤 확대해 들어갈 곳. 화면 칸 기준 비율 좌표와 배율이다.
  focus: { x: number; y: number; zoom: number };
  // 좁은 폭에서는 노트북을 고정하지 않고, 문장 아래 이 확대본을 붙인다
  detail: { src: string; width: number; height: number };
  alt: string;
}

const BEATS: Beat[] = [
  {
    title: ['올리면, 끝.'],
    body: '강의 자료와 녹음만 있으면 됩니다.',
    screen: '/landing/screen-upload.webp',
    focus: { x: 0.57, y: 0.53, zoom: 1.35 },
    detail: { src: '/landing/screen-upload.webp', width: 2400, height: 1500 },
    alt: '새 주차 업로드 화면. 강의 자료와 녹음 파일을 올리는 칸이 있다.',
  },
  {
    title: ['슬라이드 옆에,', '요약.'],
    body: '넘기는 대로 바로 읽습니다.',
    screen: '/landing/screen-study.webp',
    focus: { x: 0.58, y: 0.58, zoom: 1.18 },
    detail: { src: '/landing/detail-summary.webp', width: 1050, height: 700 },
    alt: '강의 PDF 옆에 열린 AI 요약.',
  },
  {
    title: ['놓친 말은,', '그 페이지에서 다시.'],
    body: '녹음이 페이지마다 나뉘어 있습니다.',
    screen: '/landing/screen-script.webp',
    focus: { x: 0.765, y: 0.45, zoom: 1.9 },
    detail: { src: '/landing/detail-replay.webp', width: 1140, height: 600 },
    alt: '강의 자료 페이지별로 나뉜 원문 스크립트와 녹음 구간.',
  },
  {
    title: ['모르면,', '바로.'],
    body: '이번 주 강의를 아는 AI에게 물어보세요.',
    screen: '/landing/screen-chat.webp',
    focus: { x: 0.81, y: 0.27, zoom: 2 },
    detail: { src: '/landing/detail-chat.webp', width: 1020, height: 600 },
    alt: '학습 화면 옆 AI 챗봇의 질문과, 강의 예시를 들어 설명한 답.',
  },
  {
    title: ['D-5.', '오늘 할 일만.'],
    body: '남은 날과 할 일을 한눈에.',
    screen: '/landing/screen-home.webp',
    focus: { x: 0.795, y: 0.33, zoom: 1.6 },
    detail: { src: '/landing/detail-todo.webp', width: 980, height: 600 },
    alt: '시험 D-day와 날짜순 할 일이 모인 홈 화면.',
  },
];

// 초점이 화면 가운데 오도록 옮기고 키운다. 이미지 밖(빈 바탕)이 드러나지 않게 이동을 막는다.
function zoomTo({ x, y, zoom }: Beat['focus']) {
  const clamp = (v: number) => Math.min(0, Math.max(1 - zoom, v));
  const tx = clamp(0.5 - x * zoom) * 100;
  const ty = clamp(0.5 - y * zoom) * 100;
  return `translate(${tx}%, ${ty}%) scale(${zoom})`;
}

export function StorySection() {
  const [active, setActive] = useState(0);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // 화면 세로 가운데 띠에 들어온 문장을 지금 장면으로 본다
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
    beatRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="story"
      aria-label="시험까지의 흐름"
      className="mx-auto grid max-w-[1200px] scroll-mt-16 px-4 py-10 break-keep lg:grid-cols-[4fr_7fr] lg:gap-14"
    >
      <div>
        {BEATS.map((beat, i) => (
          <div
            key={beat.screen}
            ref={(node) => {
              beatRefs.current[i] = node;
            }}
            data-index={i}
            className="grid content-center gap-3.5 py-12 lg:min-h-[78vh] lg:py-0"
          >
            {/* 넓은 화면에서는 지금 장면만 진하게 둔다. 좁으면 노트북이 없으니 다 진하다 */}
            <h2
              className={cn(
                'text-heading-lg leading-tight font-bold text-gray-800 transition-opacity duration-300',
                active === i ? 'lg:opacity-100' : 'lg:opacity-30',
              )}
            >
              {beat.title.map((line, j) => (
                <span key={line} className="block">
                  {line}
                  {j < beat.title.length - 1 && ' '}
                </span>
              ))}
            </h2>
            <p
              className={cn(
                'text-body-lg text-gray-500 transition-opacity duration-300',
                active === i ? 'lg:opacity-100' : 'lg:opacity-50',
              )}
            >
              {beat.body}
            </p>
            <Image
              src={beat.detail.src}
              alt={beat.alt}
              width={beat.detail.width}
              height={beat.detail.height}
              sizes="(max-width: 1024px) 92vw, 1px"
              className="shadow-far mt-3 w-full rounded-md lg:hidden"
            />
          </div>
        ))}
      </div>

      {/* 노트북은 장식이다. 같은 내용을 위 문장과 확대본 이미지가 이미 전한다 */}
      <div aria-hidden className="sticky top-[18vh] hidden self-start lg:block">
        <LaptopFrame>
          {BEATS.map((beat, i) => (
            <Image
              key={beat.screen}
              src={beat.screen}
              alt=""
              fill
              sizes="(max-width: 1200px) 60vw, 700px"
              // 움직임 줄이기 설정이면 확대하지 않는다. 인라인 transform을 이기려고 !를 붙인다
              className="origin-top-left object-cover object-left-top motion-reduce:transform-none!"
              style={{
                opacity: active === i ? 1 : 0,
                transform: active === i ? zoomTo(beat.focus) : undefined,
                transition:
                  'opacity .5s ease, transform 1.1s cubic-bezier(.2,.7,.2,1) .35s',
              }}
            />
          ))}
        </LaptopFrame>
      </div>
    </section>
  );
}
