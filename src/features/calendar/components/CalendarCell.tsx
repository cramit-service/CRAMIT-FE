// src/features/calendar/components/CalendarCell.tsx
import { cn } from '@/shared/lib/cn';
import { subjectDotClass } from '@/shared/lib/subjectColor';
import type { CalendarCell as Cell } from '@/features/calendar/lib/month';

// 칸에 뜨는 한 줄. 지금은 할 일만 온다 — 시험은 달력에 따로 표시할 방법을 정하는 중이다.
export interface ScheduleItem {
  id: string;
  /** 과목(강의) id. 강의를 안 고른 TODO는 null이라 회색 막대로 떨어진다. */
  subjectId: string | null;
  label: string;
}

// 셀 높이가 고정(스크롤 없음)이라 일정을 무한정 못 담는다.
// 이 수를 넘으면 나머지를 아래 "+N" 한 줄로 접는다.
// 96 − 위쪽 선 1 − 패딩 16 − 날짜 24 − 간격 4 = 51 ≥ 48 = 줄상자 16 × 3 (일정 둘 + "+N").
// 날짜와 일정 사이는 4다. 칸을 감싸는 여백(8)보다 좁아야 둘이 한 덩어리로 읽힌다 —
// §2가 4px을 기본 단위로 고른 이유가 그것이다.
const MAX_VISIBLE = 2;

interface CalendarCellProps {
  cell: Cell;
  items: ScheduleItem[];
  isToday: boolean;
  /** 이 날짜만 보도록 TODO 체크리스트가 걸러진 상태인지 */
  isSelected: boolean;
  onSelect: () => void;
  /** 과목 id → 색 클래스. Calendar가 과목 생성 순서로 만들어 내려준다. */
  subjectDots: Map<string, number>;
}

// 하루 칸. 눌러서 그 날짜만 보게 거르고, 다시 누르면 푼다.
//
// 칸은 알약도 카드도 아니라 화면이 직접 그린다 — 격자가 이미 위쪽 선으로 칸을 가르는데
// Card는 사방 테두리와 제 여백을 또 그리고, Toggle은 한 줄짜리 알약이다.
// 대신 누른 상태는 §4의 계약을 그대로 지킨다: aria-pressed와 이름을 직접 단다.
export function CalendarCell({
  cell,
  items,
  isToday,
  isSelected,
  onSelect,
  subjectDots,
}: CalendarCellProps) {
  const visible = items.slice(0, MAX_VISIBLE);
  const hiddenCount = items.length - visible.length;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`${cell.day}일${items.length > 0 ? ` 일정 ${items.length}건` : ''}`}
      onClick={onSelect}
      className={cn(
        'flex h-full min-h-24 w-full min-w-0 cursor-pointer flex-col gap-1 overflow-hidden rounded-md border-t border-gray-200 p-2 text-left transition-colors',
        'focus-visible:ring-sky-ink focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
        // 고른 날은 면으로 칠한다 — §2가 넓은 면에 남긴 연두(pale)고, Card의 selected가
        // 이미 그 값을 쓴다. 전에는 outline이었는데 그 색이 토큰에 없어 아무것도 안 그려졌다.
        // 호버는 Card와 같은 방식으로 제 채움에 곱한다(고정 색이면 고른 날에서 색이 뒤집힌다).
        isSelected ? 'bg-lime-pale hover:brightness-92' : 'hover:bg-gray-100',
      )}
    >
      <span
        className={cn(
          // 오늘이든 아니든 같은 크기 원형 슬롯을 써서 숫자 위치가 흔들리지 않게 한다.
          'text-label inline-flex size-6 shrink-0 items-center justify-center rounded-full leading-none',
          isToday && 'bg-gray-800 text-gray-100',
          !isToday && cell.isCurrentMonth && 'text-gray-800',
          !isToday && !cell.isCurrentMonth && 'text-gray-400',
          isToday ? 'font-semibold' : 'font-medium',
        )}
      >
        {cell.day}
      </span>
      {items.length > 0 && (
        <span className="flex min-w-0 flex-col">
          {visible.map((item) => (
            // 칸 폭이 좁아 이름이 잘린다. 잘린 채로는 어느 일정인지 알 수 없어
            // title로 전체를 보여준다.
            <span
              key={item.id}
              title={item.label}
              className="flex min-w-0 items-center gap-2"
            >
              {/* §2: 이름을 달고 있는 색은 막대다(3 × 줄상자). 점이었는데 같은 자리에서
                  막대가 더 크고(48px² vs 28px²) 폭은 덜 먹는다. */}
              <span
                aria-hidden
                className={cn(
                  'h-4 w-[3px] shrink-0 rounded-full',
                  subjectDotClass(subjectDots, item.subjectId),
                )}
              />
              {/* 줄상자는 16이다. 14의 짝은 22지만 여기 글자는 문단이 아니라 잘리는 한
                  줄이고, 세 줄이 48 안에 들어가야 한다(§3: 둘이 어긋나면 읽기가 이긴다). */}
              <span className="text-label/4 truncate font-medium text-gray-700">
                {item.label}
              </span>
            </span>
          ))}
          {hiddenCount > 0 && (
            // 빈 막대 자리로 들여쓴다 — 위 일정 이름과 같은 선에서 시작한다.
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-4 w-[3px] shrink-0" />
              <span className="text-label/4 font-medium text-gray-500">
                +{hiddenCount}
              </span>
            </span>
          )}
        </span>
      )}
    </button>
  );
}
