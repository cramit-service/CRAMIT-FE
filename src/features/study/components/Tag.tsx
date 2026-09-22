// src/features/study/components/Tag.tsx
import { cn } from '@/shared/lib/cn';

// 강의 카드·상세 헤더의 라벨 태그(알약). tone은 색이 아니라 역할이다.
type Tone =
  | 'dark'
  | 'outline'
  | 'shared'
  | 'urgent'
  | 'soon'
  | 'near'
  | 'normal'
  | 'past';

// 색은 시험 긴급도에만 쓴다 — 상태 색은 채움으로, 글자는 gray-950(error 글자는 흰 바탕에서 2.7:1).
// 여유·종료·공유는 회색 테두리로 글자만 다르다.
const toneStyles: Record<Tone, string> = {
  dark: 'bg-gray-800 text-gray-200', // 교수명
  outline: 'border-[0.5px] border-gray-800 bg-white text-gray-800', // 강의 수·날짜
  urgent: 'bg-error text-gray-950', // D-DAY·D-1
  soon: 'bg-error-300 text-gray-950', // D-2
  near: 'bg-error-200 text-gray-950', // D-3
  normal: 'border-[0.5px] border-gray-500 bg-white text-gray-700',
  past: 'border-[0.5px] border-gray-500 bg-white text-gray-700',
  shared: 'border-[0.5px] border-gray-500 bg-white text-gray-700',
};

interface TagProps {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

export function Tag({ tone = 'outline', className, children }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-normal',
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
