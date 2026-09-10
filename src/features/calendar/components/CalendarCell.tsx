// src/features/calendar/components/CalendarCell.tsx
import { cn } from '@/shared/lib/cn';
import { subjectDotClass } from '@/shared/lib/subjectColor';
import type { CalendarCell as Cell } from '@/features/calendar/lib/month';

export interface ScheduleItem {
  id: string;
  type: 'exam' | 'todo';
  /** 과목(강의) id. 강의를 안 고른 TODO는 null이라 회색 점으로 떨어진다. */
  subjectId: string | null;
  label: string;
}

// 셀 높이가 고정(스크롤 없음)이라 일정을 무한정 못 담는다.
// 이 수를 넘으면 나머지를 아래 "+N" 한 줄로 접는다.
const MAX_VISIBLE = 2;

interface CalendarCellProps {
  cell: Cell;
  items: ScheduleItem[];
  isToday: boolean;
  /** 이 날짜만 보도록 TODO 체크리스트가 걸러진 상태인지 */
  isSelected: boolean;
  onSelect: () => void;
  /** 과목 id → 점 색 클래스. Calendar가 과목 생성 순서로 만들어 내려준다. */
  subjectDots: Map<string, string>;
}

// 선택 표시가 테두리가 아니라 outline인 이유: 테두리는 자리를 차지해 칸 안쪽 폭을 바꾸고,
// 그러면 선택할 때마다 일정 이름이 잘리는 위치가 달라진다. outline은 레이아웃 밖에 그린다.
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
  // 접혀서 안 보이는 시험도 링은 떠야 한다 — visible이 아니라 items 전체를 본다.
  const hasExam = items.some((item) => item.type === 'exam');

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`${cell.day}일${items.length > 0 ? ` 일정 ${items.length}건` : ''}`}
      onClick={onSelect}
      className={cn(
        'flex min-h-23 w-full min-w-0 cursor-pointer flex-col gap-2 overflow-hidden rounded-md border-t border-gray-200 px-1.5 pt-2 pb-1.5 text-left transition-colors',
        'hover:bg-gray-150',
        'focus-visible:ring-secondary-400 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
        isSelected && 'outline-secondary-400 outline-2 -outline-offset-2',
      )}
    >
      <span
        className={cn(
          // 오늘이든 아니든 같은 크기 원형 슬롯을 써서 숫자 위치가 흔들리지 않게 한다.
          'inline-flex size-6.5 shrink-0 items-center justify-center rounded-full text-[15px] leading-none',
          isToday && 'bg-gray-900 text-white',
          !isToday && cell.isCurrentMonth && 'text-gray-900',
          !isToday && !cell.isCurrentMonth && 'text-gray-400',
          isToday || hasExam ? 'font-semibold' : 'font-medium',
          // 시험 있는 날은 링. 하루에 여러 과목 시험이 겹칠 수 있어 과목 색을 쓰지 않는다.
          // 오늘이면 검정 원과 링이 붙어 버리므로 offset으로 흰 틈을 넣어 이중 원으로 만든다.
          hasExam && 'ring-[1.5px] ring-gray-900',
          hasExam && isToday && 'ring-offset-2 ring-offset-white',
        )}
      >
        {cell.day}
      </span>
      {items.length > 0 && (
        <span className="flex min-w-0 flex-col gap-1">
          {visible.map((item) => (
            // 칸 폭이 좁아 이름이 대부분 잘린다. 잘린 채로는 어느 일정인지 알 수 없어
            // title로 전체를 보여준다.
            <span
              key={item.id}
              title={item.label}
              className="flex min-w-0 items-center gap-1.5"
            >
              <span
                aria-hidden
                className={cn(
                  'size-1.5 shrink-0 rounded-full',
                  subjectDotClass(subjectDots, item.subjectId),
                )}
              />
              {/* 시험은 굵고 진하게 — 같은 칸에서 할 일보다 먼저 읽혀야 한다. */}
              <span
                className={cn(
                  'truncate text-[12px] leading-4',
                  item.type === 'exam'
                    ? 'font-semibold text-gray-950'
                    : 'text-gray-800',
                )}
              >
                {item.label}
              </span>
            </span>
          ))}
          {hiddenCount > 0 && (
            // pl-3은 점(6) + gap(6) — 접힌 개수가 위 일정 이름과 같은 선에서 시작한다.
            <span className="pl-3 text-[12px] leading-4 text-gray-600">
              +{hiddenCount}
            </span>
          )}
        </span>
      )}
    </button>
  );
}
