// src/features/calendar/components/CalendarCell.tsx
import { cn } from '@/shared/lib/cn';
import {
  SCHEDULE_TAG_BASE,
  scheduleTagClass,
} from '@/features/calendar/lib/scheduleTag';
import type { CalendarCell as Cell } from '@/features/calendar/lib/month';

export interface ScheduleItem {
  id: string;
  type: 'exam' | 'todo';
  label: string;
}

// 셀 높이가 고정(스크롤 없음)이라 태그를 무한정 못 담는다.
// 이 수를 넘으면 나머지를 "+N"으로 접어 항상 이 줄 수 안에 들어오게 한다.
// "+N"은 줄을 따로 쓰지 않고 마지막 태그 오른쪽에 붙는다 — 일정이 몇 개든 태그가 2줄이라
// 옆 칸들과 바닥선이 맞는다. 대신 마지막 태그는 "+N" 폭만큼 좁아져 이름이 더 잘린다.
const MAX_VISIBLE_TAGS = 2;

// 생김새는 features/calendar/lib/scheduleTag.ts가 정한다 — 범례와 같은 것을 써야 해서
// 한 곳에 모아 뒀다. 여기서는 종류만 넘긴다.
// 시안에서 pill은 Hug contents라 글자 폭까지만 감싼다(w-full로 늘리면 안 된다).
// 긴 이름은 칸을 넘지 않도록 max-w-full + truncate로 자른다(base에 포함).
function ScheduleTag({ item }: { item: ScheduleItem }) {
  return (
    <span className={cn(SCHEDULE_TAG_BASE, scheduleTagClass(item.type))}>
      {item.label}
    </span>
  );
}

interface CalendarCellProps {
  cell: Cell;
  items: ScheduleItem[];
  isToday: boolean;
  /** 이 날짜만 보도록 TODO 체크리스트가 걸러진 상태인지 */
  isSelected: boolean;
  onSelect: () => void;
}

// h-full/w-full을 명시해야 한다 — <button>은 display:flex를 줘도 내용 크기로 줄어들어
// grid 칸을 안 채운다. min-w-0은 안쪽 태그가 열 폭에 맞춰 잘리게 한다.
// justify-between은 시안대로 — 날짜 숫자는 위, 일정 태그는 칸 바닥에 붙는다.
//
// 선택 표시가 테두리가 아니라 outline인 이유: 테두리는 자리를 차지해 칸 안쪽 폭을 바꾸고,
// 그러면 선택할 때마다 태그가 잘리는 위치가 달라진다. outline은 레이아웃 밖에 그린다.
export function CalendarCell({
  cell,
  items,
  isToday,
  isSelected,
  onSelect,
}: CalendarCellProps) {
  const visible = items.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = items.length - visible.length;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`${cell.day}일${items.length > 0 ? ` 일정 ${items.length}건` : ''}`}
      onClick={onSelect}
      className={cn(
        'flex h-full w-full min-w-0 cursor-pointer flex-col justify-between gap-1 overflow-hidden p-1 text-left',
        'focus-visible:ring-secondary-400 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
        cell.isCurrentMonth ? 'bg-white' : 'bg-gray-200',
        isSelected && 'outline-secondary-400 outline-2 -outline-offset-2',
      )}
    >
      <span
        className={cn(
          // 오늘이든 아니든 같은 크기 원형 슬롯을 써서 숫자 위치가 흔들리지 않게 한다.
          // 숫자는 시안값 13.6px. 두 자리가 들어가도록 슬롯은 20px로 잡는다.
          // leading을 명시하지 않으면 부모에서 상속된 줄높이가 그대로 들어와
          // 글꼴이 바뀔 때 슬롯 안 위치가 흔들린다.
          'inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[13.5px] leading-5 font-medium',
          // 앞뒤 달 채움 칸에도 오늘이 올 수 있다(달을 넘기면 보인다). 네 갈래를
          // 배타적으로 두지 않으면 어두운 원 위에 흐린 글자가 얹혀 숫자가 안 보인다.
          isToday && 'bg-gray-900 text-white',
          !isToday && cell.isCurrentMonth && 'text-gray-950',
          !isToday && !cell.isCurrentMonth && 'text-gray-950/40',
        )}
      >
        {cell.day}
      </span>
      {items.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {visible.map((item, index) =>
            hiddenCount > 0 && index === visible.length - 1 ? (
              <div key={item.id} className="flex items-center gap-1">
                <ScheduleTag item={item} />
                <span className="text-button-sm shrink-0 font-medium text-gray-500">
                  +{hiddenCount}
                </span>
              </div>
            ) : (
              <ScheduleTag key={item.id} item={item} />
            ),
          )}
        </div>
      )}
    </button>
  );
}
