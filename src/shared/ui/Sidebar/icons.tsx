// src/shared/ui/Sidebar/icons.tsx
// 사이드바 전용 인라인 SVG 아이콘 (lucide-react 미설치라 직접 그린다).
// 색은 currentColor로 물려받아 활성/비활성 텍스트 색을 그대로 따른다.
// 대부분의 메뉴 아이콘은 실제 에셋(navIcons.tsx)을 쓰고, 여기엔 접기/펴기·묶음 토글용
// chevron과, 에셋이 아직 없는 두 항목(공유 강의·강의 관리)을 둔다.
// TODO(디자인): 홈·공유 강의·강의 관리 아이콘 에셋을 받으면 navIcons.tsx로 옮긴다.
// 지금은 PNG 글리프들 사이에 선 굵기가 다른 SVG가 섞여 있다.

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

// 홈. 받은 에셋은 학사모라 "홈"으로 안 읽혀서 집으로 바꿨다.
export function HouseIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="m3 10.5 9-7.5 9 7.5" />
      <path d="M5.25 9.75V19.5A1.5 1.5 0 0 0 6.75 21h10.5a1.5 1.5 0 0 0 1.5-1.5V9.75" />
      <path d="M9.75 21v-6h4.5v6" />
    </StrokeIcon>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
      <circle cx="10" cy="7.5" r="3.5" />
      <path d="M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.4 4.6a3.5 3.5 0 0 1 0 6.8" />
    </StrokeIcon>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
    </StrokeIcon>
  );
}
