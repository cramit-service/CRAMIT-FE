// src/shared/ui/Sidebar/icons.tsx
// 사이드바 전용 인라인 SVG 아이콘 (lucide-react 미설치라 직접 그린다).
// 색은 currentColor로 물려받아 활성/비활성 텍스트 색을 그대로 따른다.
// 대부분의 메뉴 아이콘은 실제 에셋(navIcons.tsx)을 쓰고, 여기엔 접기/펴기·
// 최근학습 토글용 chevron만 둔다.

interface IconProps {
  className?: string;
}

// 공통 stroke 아이콘 래퍼
function StrokeIcon({
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
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
