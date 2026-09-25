// src/shared/ui/Sidebar/icons.tsx
// 사이드바 전용 인라인 SVG 아이콘 (lucide-react 미설치라 직접 그린다).
// 색은 currentColor로 물려받아 활성/비활성 텍스트 색을 그대로 따른다.
// TODO: shared/ui/Icon.tsx의 레지스트리로 합친다 — 지금 아이콘이 일곱 파일에 흩어져 있고
//       ChevronDown만 세 곳에 따로 그려져 있다.

interface IconProps {
  className?: string;
}

// 아이콘 칸에 서는 글리프의 획 굵기. 0.8이던 건 옆에 서던 PNG 에셋의 획(60px 캔버스에서
// 2px = 24 뷰박스의 0.8)에 맞춘 값이었는데, 그 에셋을 걷어 내면서 맞출 대상이 없어졌다.
// 2는 잉크(gray-800)로 칠한 24px 글리프가 옆의 글자와 같은 무게로 읽히는 지점이다.
const GLYPH_STROKE = 2;

// 공통 stroke 아이콘 래퍼
function StrokeIcon({
  className,
  strokeWidth = 1.5,
  children,
}: IconProps & { strokeWidth?: number; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="m15 18-6-6 6-6" />
    </StrokeIcon>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="m9 18 6-6-6-6" />
    </StrokeIcon>
  );
}

export function ChevronUpIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="m18 15-6-6-6 6" />
    </StrokeIcon>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="m6 9 6 6 6-6" />
    </StrokeIcon>
  );
}

// 홈. 받은 에셋은 학사모라 "홈"으로 안 읽혀서 집으로 바꿨다.
export function HouseIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className} strokeWidth={GLYPH_STROKE}>
      <path d="m3 10.5 9-7.5 9 7.5" />
      <path d="M5.25 9.75V19.5A1.5 1.5 0 0 0 6.75 21h10.5a1.5 1.5 0 0 0 1.5-1.5V9.75" />
      <path d="M9.75 21v-6h4.5v6" />
    </StrokeIcon>
  );
}

// 내 강의 — 펼친 책. PNG 에셋(book-off.png)을 대신한다. 에셋은 색도 획도 CSS로
// 못 바꿔서, 옆의 SVG들이 거기 맞춰 얇게 그려져 있었다.
export function BookIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className} strokeWidth={GLYPH_STROKE}>
      <path d="M12 6.5C10.5 5 8.5 4.25 6 4.25H3.5v13.5H6c2.5 0 4.5.75 6 2.25" />
      <path d="M12 6.5c1.5-1.5 3.5-2.25 6-2.25h2.5v13.5H18c-2.5 0-4.5.75-6 2.25" />
      <path d="M12 6.5V20" />
    </StrokeIcon>
  );
}
