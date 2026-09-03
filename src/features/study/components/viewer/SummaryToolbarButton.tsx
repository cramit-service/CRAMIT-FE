'use client';
// src/features/study/components/viewer/SummaryToolbarButton.tsx
import { cn } from '@/shared/lib/cn';

// 요약 탭 상단 바 버튼. 어두운 패널 위에 올라가서 shared/ui의 Button variant와 색 역할이 달라
// (예: 배경 없는 흰 글자 버튼) 이 탭 전용으로 둔다.
type Tone = 'ghost' | 'gradient' | 'point' | 'muted';

// cn은 merge가 없으므로 tone별로 서로 겹치지 않는 '완성된' 색 세트를 고른다.
const toneStyles: Record<Tone, string> = {
  // Markdown 복사하기 — 채움 없이 gray-500 테두리 + 흰 글자
  ghost: 'border-[0.5px] border-gray-500 text-white hover:bg-gray-800',
  // PDF로 다운로드 — 흰 바탕에 연보라→흰색→연노랑 파스텔 그라데이션.
  // Figma는 블러 처리한 그라데이션 덩어리를 버튼 안에 넣어 잘라 쓰는데(Ellipse 72),
  // 색이 level-01(#f0abff)→level-02(#ffde65)라 토큰 그라데이션으로 대체한다.
  // 시안 픽셀값(좌 #fcf2f7 / 우 #fff8e0)에 맞춘 농도이며, 가운데는 흰색으로 비운다.
  gradient:
    'border-[0.5px] border-gray-700 from-level-01/15 via-white to-level-02/20 bg-white bg-linear-to-r text-gray-900 hover:from-level-01/25 hover:to-level-02/30',
  // 수정하기 / 수정완료 — 시그니처 연두 (핵심 CTA)
  point: 'bg-primary-400 text-gray-900 hover:bg-primary-500',
  // 수정취소 — 중립 회색
  muted: 'bg-gray-400 text-gray-900 hover:bg-gray-500',
};

interface SummaryToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone: Tone;
}

export function SummaryToolbarButton({
  tone,
  className,
  disabled,
  children,
  ...props
}: SummaryToolbarButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'text-label flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 font-medium whitespace-nowrap transition-colors',
        // 비활성이면 회색만, 아니면 tone 색상 (shared/ui/Button과 같은 방식)
        disabled
          ? 'cursor-not-allowed bg-gray-600 text-gray-400'
          : toneStyles[tone],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
