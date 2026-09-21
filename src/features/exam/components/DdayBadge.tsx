// src/features/exam/components/DdayBadge.tsx
import { cn } from '@/shared/lib/cn';
import { ddayLabel } from '@/features/exam/lib/dday';

// 시험 D-DAY 뱃지. 홈 배너와 다가오는 시험 일정 목록이 같은 것을 쓴다 —
// 같은 시험의 D-DAY가 좌우에서 다르게 보이면 안 되므로 생김새를 여기 한 곳에서만 정한다.
// shared/ui가 아니라 features/exam에 두는 이유: 쓰는 쪽이 둘 다 이 기능 안이다(CLAUDE.md 3절).
// 다른 기능이 쓰게 되면 그때 shared/ui로 올린다.
interface DdayBadgeProps {
  /** 시험까지 남은 일수. 0이면 D-DAY, 음수면 이미 지난 시험. */
  days: number;
  /** 홈 배너용. 색·글자는 목록과 같고 세로 여백만 작다(시안 61×26). */
  onGradient?: boolean;
  className?: string;
}

// 폭을 안 잡으면 글자 수대로 "D-DAY"는 넓고 "D-1"은 좁아져 목록이 들쭉날쭉해진다.
const BASE =
  'inline-flex items-center justify-center rounded-md px-2.5 text-center font-semibold whitespace-nowrap';

// 가까울수록 진해진다. 상태 색은 채움으로만 쓴다 — error 글자는 밝은 바탕에서 2.7:1이다.
// 지난 시험(음수)은 가장 진한 단계에 둔다.
function toneFor(days: number) {
  if (days <= 1) return 'bg-error text-gray-950';
  if (days === 2) return 'bg-error-300 text-gray-950';
  if (days === 3) return 'bg-error-200 text-gray-950';
  return 'bg-gray-200 text-gray-700';
}

export function DdayBadge({
  days,
  onGradient = false,
  className,
}: DdayBadgeProps) {
  return (
    <span
      className={cn(
        BASE,
        'text-label',
        onGradient ? 'min-w-14.5 py-0.5' : 'min-w-16 py-1.25',
        toneFor(days),
        className,
      )}
    >
      {ddayLabel(days)}
    </span>
  );
}
