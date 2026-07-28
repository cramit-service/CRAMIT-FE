// src/features/study/components/viewer/icons.tsx
// 학습 뷰어 전용 아이콘. 챕터 상세용 라인 아이콘(../icons.tsx)과 쓰임이 달라 분리한다.
// 크기는 className으로 조절하고 색은 currentColor를 따른다.
// 아래 선(stroke) 아이콘들은 Figma에서 내보낸 벡터 경로를 그대로 옮긴 것이라
// viewBox가 24 격자가 아니다. 크기는 반드시 가로·세로를 함께 지정한다.

interface IconProps {
  className?: string;
}

// 오디오 재생 (Figma: 채워진 삼각형)
export function PlayIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className ?? 'size-5'}
      aria-hidden
    >
      <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

// 오디오 일시정지 (Figma: 채워진 막대 2개)
export function PauseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className ?? 'size-5'}
      aria-hidden
    >
      <rect x="6" y="4.5" width="4.5" height="15" rx="1" />
      <rect x="13.5" y="4.5" width="4.5" height="15" rx="1" />
    </svg>
  );
}

// PDF로 다운로드 (Figma: 구름 + 아래 화살표)
export function CloudDownloadIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 23 15"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-[11px] w-[17px]'}
      aria-hidden
    >
      <path d="M11.5 4.5V10.5M8.5 8.5L11.5 10.5L14.5 8.5M22.5 10.5C22.5 8.29086 20.7091 6.5 18.5 6.5C18.4764 6.5 18.4532 6.50021 18.4297 6.50062C17.9447 3.10802 15.0267 0.5 11.5 0.5C8.70335 0.5 6.29019 2.14004 5.16895 4.51082C2.56206 4.68144 0.5 6.84981 0.5 9.49985C0.5 12.2613 2.73858 14.5001 5.5 14.5001L18.5 14.5C20.7091 14.5 22.5 12.7091 22.5 10.5Z" />
    </svg>
  );
}

// 맨 위로 (Figma: 요약 영역 우하단 원형 버튼 안의 위 화살표)
export function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 21 25"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-[17px] w-[14px]'}
      aria-hidden
    >
      <path d="M10.5 24V1M20 9.66667L10.5 1L1.00001 9.66667" />
    </svg>
  );
}
