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
  /** 홈 배너용. 색 규칙은 목록과 같고 크기만 한 단계 작다. */
  onGradient?: boolean;
  className?: string;
}

// 폭을 안 잡으면 글자 수대로 "D-DAY"는 넓고 "D-1"은 좁아져 목록이 들쭉날쭉해진다.
const BASE =
  'inline-flex items-center justify-center rounded-md px-2.5 text-center font-semibold whitespace-nowrap';

export function DdayBadge({
  days,
  onGradient = false,
  className,
}: DdayBadgeProps) {
  // 색은 두 단계뿐이다 — D-3 이하가 긴급, D-4부터는 일반.
  // 지난 시험(음수)도 긴급 쪽에 둔다(이전 구간 분기와 같은 처리).
  const urgent = days <= 3;

  return (
    <span
      className={cn(
        BASE,
        onGradient
          ? 'min-w-14.5 py-1.25 text-[13px] leading-4'
          : 'min-w-16 py-1.5 text-[14px] leading-5',
        // 색은 배너·목록이 같은 2단계를 탄다.
        urgent ? 'bg-error-50 text-error' : 'bg-gray-200 text-gray-700',
        className,
      )}
    >
      {ddayLabel(days)}
    </span>
  );
}
