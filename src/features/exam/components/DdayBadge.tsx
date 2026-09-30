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
  /** 홈 배너용. 이제 색·글자·높이가 목록과 같고 최소폭만 좁다(시안 61×26).
   *  남은 차이가 6px뿐이라 지울 후보다 — 홈 회차에서 목록·배너 치수를 같이 볼 때 정한다. */
  onGradient?: boolean;
  className?: string;
}

// 굵기는 500이다. §3이 600을 heading·emphasis에, 500을 "fragments — labels, metadata"에
// 주는데 남은 일수는 metadata다. 600이던 건 규칙 밖이었다.
//
// 높이는 26이다(글자 22 + py-0.5). 한 단 위인 32는 옆에 서는 글자와 같은 14px인데
// 상자만 커서 값보다 알약이 먼저 읽혔다. §3의 램프가 14에서 멈추므로 글자는 못 내린다 —
// "12px은 상자가 좁아서 생기는 것이고, 좁은 상자는 레이아웃이 풀 문제"라고 적혀 있다.
// 그래서 내려간 건 상자뿐이고, 그 값은 홈 배너가 이미 쓰던 칸이다.
//
// 폭을 안 잡으면 글자 수대로 "D-DAY"는 넓고 "D-1"은 좁아져 목록이 들쭉날쭉해진다.
// 모서리는 알약이다. 채움을 두른 네모는 §2에서 전부 컨트롤이라(md 6 = 버튼·필드·줄,
// sm 4 = 작은 표식) 작은 네모에 색을 칠하면 작은 버튼으로 읽힌다. 이건 누를 수 없는 값이다.
// §2가 알약에 준 "상태를 든 컨트롤"이라는 뜻과 부딪히지 않는다 — 그 뜻이 가르는 건
// 똑같이 연두이고 똑같이 눌리는 토글과 버튼 사이고, 주황이고 안 눌리는 이건 그 비교에 없다.
//
// px가 10이라 §2 간격 목록 밖이다. 12로 올리면 "D-DAY"가 66이 되어 아래 min-w(64)를
// 넘고, 짧은 라벨만 64에 걸려 알약 폭이 둘로 갈린다. 세로로 늘어선 목록에서 그게 보인다.
// 홈 배너 쪽(min-w-14.5)은 시안이 61이라 같은 이유로 더 좁다. 목록·배너의 치수를
// 같이 다시 볼 때 함께 정리한다.
const BASE =
  'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-center font-medium whitespace-nowrap';

// 가까울수록 진해진다. §2가 빨강과 주황을 갈라 놨다 — 빨강은 잘못된 것,
// 주황은 줄어드는 것. 시험까지 남은 날은 줄어드는 쪽이라 amber를 탄다.
// (옛 error·error-300·error-200은 토큰에 없어서 알약이 통째로 투명하게 렌더되고 있었다.)
//
// 단이 셋인 건 고른 게 아니라 amber 토큰이 셋이라서다. 경계만 정하면 됐고, 절반씩 접었다:
// 램프의 색 단계가 ΔE 29.9와 29.0으로 거의 같아서, 색이 고르게 걸으면 날짜도 고르게
// 걸어야 한다. 남은 시간은 비율로 느껴지므로(§2가 간격에서 쓴 그 논거) 14 → 7 → 3이다.
// 경계 셋이 다 사람이 쓰는 단위이기도 하다 — 2주, 일주일, 사흘.
// 균등 분할(14–10 / 9–5 / 4–0)은 마지막 띠가 첫 띠와 같은 무게로 읽혀서 버렸다.
//
function toneFor(days: number) {
  if (days <= 3) return 'bg-amber-300 text-gray-800'; // 사흘
  if (days <= 7) return 'bg-amber-200 text-gray-800'; // 일주일
  if (days <= 14) return 'bg-amber-100 text-gray-800'; // 2주
  return 'bg-gray-200 text-gray-700'; // 아직 멀다 — 색이 붙지 않는다
}

export function DdayBadge({
  days,
  onGradient = false,
  className,
}: DdayBadgeProps) {
  // 지난 시험은 뱃지를 만들지 않는다. 남은 일수를 세는 부품이라 셀 것이 없으면 할 말이
  // 없고, 자리를 지키는 회색 알약은 "아직 뭔가 남았다"로 읽힌다.
  // 호출처 셋이 함께 쓰므로 여기서 한 번 막는다.
  if (days < 0) return null;

  return (
    <span
      className={cn(
        BASE,
        'text-label',
        onGradient ? 'min-w-14.5' : 'min-w-16',
        toneFor(days),
        className,
      )}
    >
      {ddayLabel(days)}
    </span>
  );
}
