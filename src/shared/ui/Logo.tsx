'use client';
// src/shared/ui/Logo.tsx
// Figma "Logo" 시안 기준. 4가지 형태를 지원한다.
// - wordmark : CRAMIT. 워드마크 (기본)
// - symbol   : 알약 심볼 마크만
// - lockup   : 심볼 + 워드마크 세로 조합 (타이포+심볼)
// - appIcon  : 둥근 사각 앱 아이콘/파비콘 (dark = 검정 배경·흰 글자, lime = 연두 배경·검정 글자)
import Image from 'next/image';
import { cn } from '@/shared/lib/cn';

type LogoVariant = 'wordmark' | 'symbol' | 'lockup' | 'appIcon';
type AppIconTone = 'dark' | 'lime';

interface LogoProps {
  variant?: LogoVariant;
  // appIcon 전용: 다크 파비콘 / 연두 파비콘
  tone?: AppIconTone;
  // 크기는 className으로 조절한다. 워드마크는 높이만 주면 비율이 유지된다(h-6 등).
  className?: string;
}

// CRAMIT 심볼 마크. 실제 로고 에셋(public/logo-symbol.png)을 그대로 사용한다.
// 연두·하늘 두 알약이 겹치는 반투명 표현이 원본 디자인이라 이미지로 넣는다.
// 크기(높이)는 호출처가 정한다 — 기본 클래스에 두면 호출처 클래스와 충돌한다(cn은 tailwind-merge 아님).
function SymbolMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-symbol.png"
      alt="CRAMIT"
      width={34}
      height={48}
      className={cn('w-auto select-none', className)}
    />
  );
}

// CRAMIT 워드마크. Figma에서 내보낸 벡터를 그대로 옮겼다(전용 서체라 폰트로 대체 불가).
// 글자는 fill-current라 부모의 text-* 색을 따르고, 마침표(dot)는 dotClassName으로 색을 준다.
// 기본 마침표 색은 시그니처 연두(primary-400)이고, 연두 배경 위에서는 어둡게 덮어쓴다.
//
// 크기·색은 호출처가 정한다(cn은 tailwind-merge가 아니라 단순 join이라 기본 클래스를 박으면
// 호출처 클래스와 충돌한다). 기본 높이만 height 속성(24)으로 주고 — 클래스는 속성을 이기므로
// 호출처가 h-* 하나만 주면 그 값이 확실히 이긴다. 색은 부모 text-*(currentColor)를 물려받는다.
function Wordmark({
  className,
  dotClassName = 'fill-primary-400',
}: {
  className?: string;
  dotClassName?: string;
}) {
  return (
    <svg
      viewBox="0 0 336 68"
      height={24}
      fill="none"
      role="img"
      aria-label="CRAMIT"
      className={cn('select-none', className)}
    >
      {/* C */}
      <path
        className="fill-current"
        d="M25.3945 0C39.3544 0.000182634 50.6817 11.2649 50.7861 25.2002H34.8545V24.5605C34.8543 19.3909 30.6638 15.2004 25.4941 15.2002C20.3244 15.2002 16.1331 19.3908 16.1328 24.5605V43.6387C16.1328 48.8086 20.3242 53 25.4941 53C30.6639 52.9998 34.8545 48.8085 34.8545 43.6387V43.582L50.3164 47.4922C48.0383 59.1787 37.7475 67.9998 25.3945 68C11.3697 68 0 56.6303 0 42.6055V25.3945C0 11.3697 11.3697 0 25.3945 0Z"
      />
      {/* R */}
      <path
        className="fill-current"
        d="M85.6572 0C97.0893 0.000217836 106.356 9.26803 106.356 20.7002C106.356 31.4111 98.2215 40.2209 87.793 41.29L106.418 68H86.7236L72.0996 47.0273V68H55.9668V0H85.6572ZM72.0996 29.4004H80.4648V29.3916C80.5759 29.3958 80.6877 29.4004 80.7998 29.4004H83.1172C87.922 29.4004 91.8173 25.505 91.8174 20.7002C91.8174 15.8953 87.9221 12 83.1172 12H80.7998C80.6877 12 80.5759 12.0036 80.4648 12.0078V12H72.0996V29.4004Z"
      />
      {/* A */}
      <path
        className="fill-current"
        d="M141.226 0C152.658 0.000217836 161.925 9.26803 161.925 20.7002C161.925 20.9345 161.92 21.1679 161.912 21.4004H161.925V68H145.792V44.8477L145.763 44.8135C145.781 44.6784 145.792 44.5406 145.792 44.4004C145.792 42.7467 144.46 41.4056 142.814 41.4004L142.765 41.3428C142.256 41.3801 141.743 41.4004 141.226 41.4004H132.235C131.634 41.4004 131.039 41.3725 130.451 41.3223L130.372 41.4131C128.855 41.5564 127.668 42.8395 127.668 44.4004C127.668 44.4475 127.669 44.4944 127.671 44.541L127.668 44.5459V68H111.535V40.7773L127.668 37.1064L112.31 15.0703C114.762 6.37387 122.754 0 132.235 0H141.226ZM136.368 12C131.563 12 127.668 15.8953 127.668 20.7002C127.668 20.7335 127.671 20.7666 127.671 20.7998H127.668V29.4004H145.792V20.7998H145.79C145.79 20.7666 145.792 20.7334 145.792 20.7002C145.792 15.8954 141.897 12.0002 137.093 12H136.368Z"
      />
      {/* M */}
      <path
        className="fill-current"
        d="M189.822 0C194.579 0 198.96 1.60553 202.456 4.30273C205.952 1.60543 210.333 0 215.09 0H217.109C228.541 0.000256573 237.809 9.26806 237.809 20.7002C237.809 20.7334 237.808 20.7666 237.808 20.7998H237.809V68H221.676V21.7764C221.676 18.6967 219.179 16.2003 216.1 16.2002C213.02 16.2002 210.523 18.6966 210.522 21.7764V68H194.39V21.7764C194.389 18.6967 191.893 16.2004 188.813 16.2002C185.734 16.2002 183.237 18.6966 183.236 21.7764V68H167.104V21.4004H167.117C167.109 21.1679 167.104 20.9345 167.104 20.7002C167.104 9.2679 176.371 0 187.804 0H189.822Z"
      />
      {/* I */}
      <rect className="fill-current" x="242.987" width="16.1328" height="68" />
      {/* T */}
      <path
        className="fill-current"
        d="M314.688 16.2002H297.561V68H281.428V16.2002H264.299V0H314.688V16.2002Z"
      />
      {/* 마침표 — 기본은 시그니처 연두, 배경색에 따라 dotClassName으로 덮어쓴다 */}
      <rect
        className={dotClassName}
        x="314.689"
        y="51.8"
        width="16.1328"
        height="16.2"
        rx="8.06639"
      />
    </svg>
  );
}

// 심볼 + 워드마크 세로 조합 (Figma "타이포+심볼")
function Lockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex flex-col items-center gap-3 text-gray-950',
        className,
      )}
      role="img"
      aria-label="CRAMIT"
    >
      <SymbolMark className="h-16" />
      <Wordmark className="h-5" />
    </div>
  );
}

// 둥근 사각 앱 아이콘 / 파비콘 (Figma "파비콘")
// dark : gray-900 배경 · 흰 글자 · 연두 마침표 / lime : primary-400 배경 · 검정 글자·마침표
function AppIcon({
  tone = 'dark',
  className,
}: {
  tone?: AppIconTone;
  className?: string;
}) {
  const isLime = tone === 'lime';
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-[22%]',
        // Figma: 200px 박스에 코너 40px(≈20%). 글자색은 배경 대비로 결정한다.
        isLime ? 'bg-primary-400 text-gray-950' : 'bg-gray-900 text-gray-100',
        'size-12',
        className,
      )}
      role="img"
      aria-label="CRAMIT"
    >
      <Wordmark
        // 높이는 컨테이너 폭(82%)에 맞춰 자동, 글자색은 컨테이너 text-*를 물려받는다
        className="h-auto w-[82%]"
        // 연두 배경에선 마침표도 어둡게, 다크 배경에선 시그니처 연두 유지
        dotClassName={isLime ? 'fill-gray-950' : 'fill-primary-400'}
      />
    </div>
  );
}

// CRAMIT 로고. 기본은 워드마크.
export function Logo({ variant = 'wordmark', tone, className }: LogoProps) {
  switch (variant) {
    case 'symbol':
      // 기본 높이는 여기서만 주고(호출처가 안 주면 h-11), 리프 SymbolMark엔 두지 않아 충돌을 막는다
      return <SymbolMark className={cn('h-11', className)} />;
    case 'lockup':
      return <Lockup className={className} />;
    case 'appIcon':
      return <AppIcon tone={tone} className={className} />;
    default:
      // 워드마크 기본 글자색만 여기서 준다(호출처는 높이만 주므로 색 충돌 없음)
      return <Wordmark className={cn('text-gray-950', className)} />;
  }
}
