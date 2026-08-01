'use client';
// src/shared/ui/GradientBackground.tsx
import { cn } from '@/shared/lib/cn';

type BlobVariant = 'default' | 'wide';

interface GradientBackgroundProps {
  // true면 부모를 꽉 채우는 배경 레이어가 된다 (부모에 relative 필요).
  // false면 스스로 relative 컨테이너가 되어 children을 감싼다.
  layer?: boolean;
  // 'default'는 세로로 큰 영역(랜딩·로그인)용.
  // 'wide'는 넓고 낮은 영역(홈 학습 배너)용 — 같은 코너 배치에서 블롭 크기만 살짝 줄여
  // 사이로 배경이 비치게 한다.
  variant?: BlobVariant;
  className?: string;
  children?: React.ReactNode;
}

// 블롭 4개. 코너 배치·색·불투명도·애니메이션은 두 variant가 공유하고 크기(h/w)만 갈린다.
// 한 벌로 묶어둬야 한쪽만 고쳐서 어긋나는 일이 없다. wide는 default의 약 0.9배다.
const BLOBS: { placement: string; default: string; wide: string }[] = [
  {
    // 우상단 연두 — 시안에서 가장 진한 지점
    placement:
      'bg-primary-300 animate-drift-1 -top-[25%] -right-[25%] opacity-55',
    default: 'h-[130%] w-[50%]',
    wide: 'h-[117%] w-[45%]',
  },
  {
    // 좌상단 하늘
    placement:
      'bg-secondary-300 animate-drift-2 -top-[30%] -left-[15%] opacity-28',
    default: 'h-[85%] w-[45%]',
    wide: 'h-[76%] w-[40%]',
  },
  {
    // 중앙 연두 wash — 시안의 좌측 끝은 무채색이라 왼쪽 끝까지 닿지 않게 둔다
    placement:
      'bg-primary-300 animate-drift-3 -bottom-[20%] left-[15%] opacity-28',
    default: 'h-[85%] w-[45%]',
    wide: 'h-[76%] w-[40%]',
  },
  {
    // 우하단 하늘
    placement:
      'bg-secondary-300 animate-drift-4 -right-[15%] -bottom-[25%] opacity-45',
    default: 'h-[75%] w-[50%]',
    wide: 'h-[67%] w-[45%]',
  },
];

// 랜딩 히어로·하단 CTA·시작 화면이 공유하는 파스텔 mesh 배경.
//
// Figma는 primary/secondary 그라데이션을 먹인 거대한 블롭 두 개(Ellipse 71·72)를
// blur 200으로 흐린 뒤 50% 불투명도로 겹쳐 쓴다. 그 벡터 모양은 CSS로 옮길 수 없어
// 시안 렌더를 5x5로 샘플링해 같은 색 분포가 나오도록 블롭 배치를 맞췄다.
//   좌상단 하늘(#DEF3F6) · 우상단 연두(#ECF8BC, 가장 진함)
//   좌하단 연두 wash · 우하단 하늘(#CFF1F0)
// 색은 Ellipse가 쓰는 원본 토큰(primary-300/secondary-300)을 그대로 쓴다.
//
// 블롭은 각자 다른 주기로 천천히 떠다닌다(globals.css의 drift-1~4). 위 샘플링으로 맞춘
// 배치가 진동의 '중심'이라 움직여도 시안과의 색 분포는 유지된다.
export function GradientBackground({
  layer = false,
  variant = 'default',
  className,
  children,
}: GradientBackgroundProps) {
  return (
    // isolate로 스택 컨텍스트를 만들어 -z-10 블롭이 부모 배경 뒤로 빠지지 않게 한다.
    // position은 cn()이 병합해주지 않으므로 className으로 덮지 말고 layer로 분기한다.
    <div
      className={cn(
        'bg-primary-100 isolate overflow-hidden',
        layer ? 'absolute inset-0' : 'relative',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {BLOBS.map((blob) => (
          <div
            key={blob.placement}
            className={cn(
              'absolute rounded-full blur-[120px] will-change-transform motion-reduce:animate-none',
              blob.placement,
              blob[variant],
            )}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
