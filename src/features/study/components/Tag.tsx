// src/features/study/components/Tag.tsx
import { cn } from '@/shared/lib/cn';

// 챕터 상세 헤더의 라벨 태그(알약). tone으로 색 역할을 구분한다.
type Tone =
  'dark' | 'outline' | 'shared' | 'urgent' | 'warning' | 'normal' | 'past';

// cn은 merge가 없으므로 tone별로 서로 겹치지 않는 '완성된' 색 세트를 고른다.
// Figma: 교수명만 채움(dark), 나머지는 0.5px 테두리 + 색 글자(채움 없음) 배지 언어를 따른다.
const toneStyles: Record<Tone, string> = {
  dark: 'bg-gray-800 text-gray-200', // 교수명 (#2b2e36 / #f0f1f1)
  outline: 'border-[0.5px] border-gray-800 bg-white text-gray-800', // 강의 수 (#2b2e36)
  shared: 'border-[0.5px] border-level-01 bg-white text-level-01', // 공유받은 강의 (#f0abff)
  urgent: 'border-[0.5px] border-error bg-white text-error', // 시험 임박(D-DAY~D-3)
  warning: 'border-[0.5px] border-warning bg-white text-warning', // 시험 주의(D-4~D-7)
  normal: 'border-[0.5px] border-secondary-500 bg-white text-secondary-600', // 시험 여유
  past: 'border-[0.5px] border-gray-400 bg-white text-gray-500', // 시험 종료
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
