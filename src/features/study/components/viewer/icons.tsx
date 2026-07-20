// src/features/study/components/viewer/icons.tsx
// 학습 뷰어 전용 아이콘. 채움(fill) 글리프라 라인 아이콘(../icons.tsx)과 분리한다.
// 크기는 className으로 조절하고 색은 currentColor를 따른다.

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
