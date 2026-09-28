'use client';
// src/shared/ui/GradientBackground.tsx
import { cn } from '@/shared/lib/cn';

type Variant = 'default' | 'banner';

interface GradientBackgroundProps {
  // true면 부모를 꽉 채우는 배경 레이어가 된다 (부모에 relative 필요).
  // false면 스스로 relative 컨테이너가 되어 children을 감싼다.
  layer?: boolean;
  // 'default'는 세로로 큰 영역(랜딩·로그인)용 — 아래 블롭 넷.
  // 'banner'는 홈 학습 배너용 — 그 아래 «쓸기» 하나.
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

// 홈 학습 배너(시안 24:10178). 시안은 «도형»이 아니다 — 연두→하늘 선형 그라디언트를 먹인
// 괴상한 path 하나를 stdDeviation 78로 흐려 놓은 것이고, 그 흐림이 모양을 다 먹는다.
// 629×198 상자에 픽셀을 투영해 재 보면 색이 그라디언트 축 좌표만의 함수로 정리되고
// (같은 축 좌표 안 편차 13~23/255), 세로 방향으로는 변화가 남지 않는다 — path가 상자보다
// 훨씬 크고 높아서 상자에 걸리는 게 대각선 쓸기 하나뿐이다.
//
// 그래서 구역마다 다르게 보이는 건 도형이 아니라 **축의 각도**다. 시안의 x1,y1→x2,y2를
// CSS 각도로 환산하면 255.3°이고, 스톱을 퍼센트로 두면 상자 크기를 알아서 따라간다.
// 블롭 넷 + blur(70px)이 하던 일을 background-image 하나가 대신한다.
//
// 색은 §2의 lime-action·sky-status다. 시안은 #E9FC47/#7FDEF7인데 §2에 없는 이름이라
// 새 토큰이 필요한가 싶었는데, 알파를 다시 맞추면 평균 ΔE 1.21로 시안 색 자신의 최적
// 적합(1.13)과 구분되지 않는다 — 20%·12%로 옅게 깔면 명도 차가 씻겨 나간다.
// 브라우저 실측으로 시안 SVG와 평균 ΔE 2.17 · 95퍼센타일 4.9. 남는 몫은 선형 하나로는
// 낼 수 없는 세로 변화인데, 판 전체가 흰색에서 ΔE 12밖에 안 떨어지는 옅은 판이라 안 보인다.
const BANNER_SWEEP =
  'bg-linear-[in_srgb_255deg] from-lime-action/20 from-0% via-sky-status/12 via-50% to-transparent to-80%';

export function GradientBackground({
  layer = false,
  variant = 'default',
  className,
  children,
}: GradientBackgroundProps) {
  const isBanner = variant === 'banner';
  return (
    // position은 cn()이 병합해주지 않으므로 className으로 덮지 말고 layer로 분기한다.
    <div
      className={cn(
        'overflow-hidden',
        layer ? 'absolute inset-0' : 'relative',
        isBanner
          ? // 표면은 부르는 쪽(카드)이 갖는다. 쓸기는 그 위에 얹는 옅은 판이라
            // 여기서 바탕을 칠하면 카드의 표면을 가린다.
            BANNER_SWEEP
          : // isolate로 스택 컨텍스트를 만들어 -z-10 블롭이 부모 배경 뒤로 빠지지 않게 한다.
            'bg-canvas isolate',
        className,
      )}
    >
      {!isBanner && (
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
