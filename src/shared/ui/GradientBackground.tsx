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

// variant마다 시안이 다르다 — 배치를 공유하지 않고 각자 한 벌씩 갖는다.
// (랜딩은 Ellipse 71·72, 홈 배너는 Ellipse 73·74로 애초에 다른 그림이다)
//
// 랜딩 히어로·하단 CTA·시작 화면용. 세로로 큰 영역이라 네 코너에 블롭을 둔다.
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

// 홈 학습 배너용(넓고 낮은 영역). 시안 렌더를 가로로 촘촘히 샘플링해 맞췄다:
//   좌측 60%는 거의 흰색 · 우상단 연두(#e9f9cd, 가장 진함) · 하단 중앙 하늘 포켓(#dff6f8)
// 배너는 높이가 142px뿐이라 default의 blur-120px를 그대로 쓰면 네 블롭이 한 덩어리로
// 뭉개져 전체가 균일한 연두가 된다. 그래서 wide만 블러를 줄이고 블롭을 더 벌려 둔다.
const WIDE_BLOBS = [
  // 우상단 연두 — 시안에서 가장 진한 지점. 중심을 오른쪽 밖 위에 두어 좌측 60%에도,
  // 우하단(시안에선 훨씬 옅다)에도 닿지 않게 한다
  'bg-primary-300 animate-drift-1 -top-[55%] -right-[15%] h-[145%] w-[40%] opacity-40',
  // 하단 중앙 하늘 포켓 — 배너 아래로 빠뜨려 위쪽 자락만 비치게 한다
  'bg-secondary-300 animate-drift-2 -bottom-[55%] left-[45%] h-[110%] w-[28%] opacity-48',
  // 우측 하늘 아주 옅게 — 시안의 우측 연두는 순수 primary보다 붉은기가 낮다(#e9f9cd).
  // 하늘을 살짝 겹쳐 R만 끌어내려야 그 올리브 기가 나온다
  'bg-secondary-300 animate-drift-3 -top-[30%] -right-[10%] h-[130%] w-[30%] opacity-12',
  // 좌하단 아주 옅은 연두 — 시안 좌측 끝이 완전한 흰색은 아니라 여기까지만 닿는다
  'bg-primary-300 animate-drift-4 -bottom-[40%] left-0 h-[80%] w-[25%] opacity-10',
];

// 랜딩 히어로·하단 CTA·시작 화면·홈 학습 배너가 공유하는 파스텔 mesh 배경.
//
// Figma는 primary/secondary 그라데이션을 먹인 거대한 블롭을 blur 200으로 흐린 뒤
// 겹쳐 쓴다. 그 벡터 모양은 CSS로 옮길 수 없어 시안 렌더를 샘플링해 같은 색 분포가
// 나오도록 블롭 배치를 맞췄다(각 variant 배열의 주석 참고).
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
  const isWide = variant === 'wide';
  return (
    // isolate로 스택 컨텍스트를 만들어 -z-10 블롭이 부모 배경 뒤로 빠지지 않게 한다.
    // position은 cn()이 병합해주지 않으므로 className으로 덮지 말고 layer로 분기한다.
    <div
      className={cn(
        'isolate overflow-hidden',
        // 배너 시안은 바탕이 순백이다. 랜딩의 따뜻한 흰색(primary-100)을 쓰면
        // 흰색이어야 할 좌측 60%까지 누렇게 뜬다.
        isWide ? 'bg-white' : 'bg-primary-100',
        layer ? 'absolute inset-0' : 'relative',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {(isWide ? WIDE_BLOBS : DEFAULT_BLOBS).map((blob) => (
          <div
            key={blob}
            className={cn(
              'absolute rounded-full will-change-transform motion-reduce:animate-none',
              isWide ? 'blur-[70px]' : 'blur-[120px]',
              blob,
            )}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
