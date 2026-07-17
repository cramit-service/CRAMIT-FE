// src/features/landing/components/icons.tsx
// 랜딩 전용 아이콘 (lucide-react 미설치라 인라인 SVG로 처리)

interface IconProps {
  className?: string;
}

// CTA 버튼의 ↗
export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

// 맨 위로 가기 버튼의 ↑
export function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

// 히어로 하단 스크롤 인디케이터(마우스 모양)
export function ScrollIndicatorIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
      className={className}
    >
      <rect x="0.75" y="0.75" width="14.5" height="22.5" rx="7.25" />
      <path d="M8 6v4" strokeLinecap="round" />
    </svg>
  );
}
