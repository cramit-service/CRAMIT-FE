// src/features/calendar/components/CalendarCell.tsx
import { cn } from '@/shared/lib/cn';
import type { CalendarCell as Cell } from '@/features/calendar/lib/month';

export interface ScheduleItem {
  id: string;
  type: 'exam' | 'todo';
  label: string;
}

// 셀 높이가 고정(스크롤 없음)이라 태그를 무한정 못 담는다.
// 이 수를 넘으면 마지막 한 칸을 "+N"으로 접어 항상 이 줄 수 안에 들어오게 한다.
const MAX_VISIBLE_TAGS = 2;

// 시험=노랑(warning), 투두=파랑(secondary) — 색 규칙은 팀 합의값.
// truncate는 부모가 min-w-0이어야 동작한다.
function ScheduleTag({ item }: { item: ScheduleItem }) {
  return (
    <span
      className={cn(
        // 시안 태그: 글자 12px · px 4 · py 3 → pill 높이 21px.
        // 글자 크기는 시안 px 그대로 두고 좌우 여백만 시안값을 따른다.
        // leading을 명시하지 않으면 상속된 줄높이가 pill을 24px로 부풀린다.
        // 시안에서 pill은 Hug contents라 글자 폭까지만 감싼다(w-full로 늘리면 안 된다).
        // 긴 이름은 칸을 넘지 않도록 max-w-full + truncate로 자른다.
        // 시안의 셀 태그는 Regular(400)다 — 네 개 중 셋이 Regular이고 하나만 Medium이라
        // 다수를 따랐다. Medium이면 작은 글자가 뭉쳐 보인다.
        'block w-fit max-w-full truncate rounded-full px-1 py-0.75 text-[12px] leading-[15px] font-normal',
        item.type === 'exam'
          ? 'bg-level-02/30 text-warning'
          : 'bg-secondary-100 text-secondary-500',
      )}
    >
      {item.label}
    </span>
  );
}

interface CalendarCellProps {
  cell: Cell;
  items: ScheduleItem[];
  isToday: boolean;
}

// h-full로 grid 줄 높이를 그대로 채우고, 넘치는 건 overflow-hidden으로 자른다.
// min-w-0을 줘야 안쪽 태그가 열 폭에 맞춰 잘린다.
// justify-between은 시안대로 — 날짜 숫자는 위, 일정 태그는 칸 바닥에 붙는다.
export function CalendarCell({ cell, items, isToday }: CalendarCellProps) {
  const visible =
    items.length > MAX_VISIBLE_TAGS
      ? items.slice(0, MAX_VISIBLE_TAGS - 1)
      : items;
  const hiddenCount = items.length - visible.length;

  return (
    <div
      className={cn(
        'flex h-full min-w-0 flex-col justify-between gap-1 overflow-hidden p-2',
        cell.isCurrentMonth ? 'bg-white' : 'bg-gray-200',
      )}
    >
      <span
        className={cn(
          // 오늘이든 아니든 같은 크기 원형 슬롯을 써서 숫자 위치가 흔들리지 않게 한다.
          // 숫자는 시안값 13.6px. 두 자리가 들어가도록 슬롯은 20px로 잡는다.
          // leading을 명시하지 않으면 부모에서 상속된 줄높이가 그대로 들어와
          // 글꼴이 바뀔 때 슬롯 안 위치가 흔들린다.
          'inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[13.5px] leading-5 font-medium',
          isToday && 'bg-gray-900 text-white',
          !isToday && cell.isCurrentMonth && 'text-gray-950',
          !cell.isCurrentMonth && 'text-gray-950/40',
        )}
      >
        {cell.day}
      </span>
      {items.length > 0 && (
        <div className="flex min-w-0 flex-col gap-1.5">
          {visible.map((item) => (
            <ScheduleTag key={item.id} item={item} />
          ))}
          {hiddenCount > 0 && (
            <span className="px-1 text-[12px] font-medium text-gray-500">
              +{hiddenCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
