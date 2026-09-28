'use client';
// src/shared/ui/GradientBackground.tsx
import { cn } from '@/shared/lib/cn';

type Variant = 'default' | 'banner' | 'login';

interface GradientBackgroundProps {
  // true면 부모를 꽉 채우는 배경 레이어가 된다 (부모에 relative 필요).
  // false면 스스로 relative 컨테이너가 되어 children을 감싼다.
  layer?: boolean;
  // 'default'는 아직 안 옮긴 랜딩용 — 아래 블롭 넷.
  // 'banner'·'login'은 각자 globals.css의 mesh-* 유틸리티를 쓴다.
  variant?: Variant;
  className?: string;
  children?: React.ReactNode;
}

// 랜딩 히어로·하단 CTA·시작 화면용. 세로로 큰 영역이라 네 코너에 블롭을 둔다.
//
// TODO(랜딩 회차): primary-300·secondary-300은 §2에 없는 이름이라 지금 아무 색도 내지
// 않는다 — 넷 다 rgba(0,0,0,0)으로 렌더되는 걸 확인했다. 랜딩을 옮길 때 아래 banner와
// 같은 방식(시안 SVG에서 축 각도를 재서 쓸기 하나로)으로 바꾼다. 그때 drift 넷도 같이 빠진다.
const DEFAULT_BLOBS = [
  // 우상단 연두 — 시안에서 가장 진한 지점
  'bg-primary-300 animate-drift-1 -top-[25%] -right-[25%] h-[130%] w-[50%] opacity-55',
  // 좌상단 하늘
  'bg-secondary-300 animate-drift-2 -top-[30%] -left-[15%] h-[85%] w-[45%] opacity-28',
  // 중앙 연두 wash — 시안의 좌측 끝은 무채색이라 왼쪽 끝까지 닿지 않게 둔다
  'bg-primary-300 animate-drift-3 -bottom-[20%] left-[15%] h-[85%] w-[45%] opacity-28',
  // 우하단 하늘
  'bg-secondary-300 animate-drift-4 -right-[15%] -bottom-[25%] h-[75%] w-[50%] opacity-45',
];

// 홈 학습 배너. 값과 그 값을 고른 이유는 globals.css의 mesh-banner에 있다 —
// 그 유틸리티가 §2 토큰을 직접 부르므로 색이 여기로 새지 않는다.
// 구역마다 다른 건 도형이 아니라 그라디언트 축의 각도다. 랜딩·챗독을 옮길 때
// 각자 mesh-* 유틸리티를 하나씩 갖고, 이 표에 한 줄씩 붙는다.
const SWEEP = { banner: 'mesh-banner', login: 'mesh-login' } as const;

export function GradientBackground({
  layer = false,
  variant = 'default',
  className,
  children,
}: GradientBackgroundProps) {
  // 표면을 부르는 쪽이 갖는 변형들. default만 아직 스스로 바탕을 칠한다.
  const mesh = variant === 'default' ? null : SWEEP[variant];
  return (
    // position은 cn()이 병합해주지 않으므로 className으로 덮지 말고 layer로 분기한다.
    <div
      className={cn(
        'overflow-hidden',
        layer ? 'absolute inset-0' : 'relative',
        mesh
          ? // 표면은 부르는 쪽이 갖는다. mesh는 그 위에 얹는 옅은 판이라
            // 여기서 바탕을 칠하면 그 표면을 가린다.
            mesh
          : // isolate로 스택 컨텍스트를 만들어 -z-10 블롭이 부모 배경 뒤로 빠지지 않게 한다.
            'bg-canvas isolate',
        className,
      )}
    >
      {!mesh && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {DEFAULT_BLOBS.map((blob) => (
            <div
              key={blob}
              className={cn(
                'absolute rounded-full blur-[120px] will-change-transform motion-reduce:animate-none',
                blob,
              )}
            />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
