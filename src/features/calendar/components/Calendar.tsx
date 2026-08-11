'use client';
// src/features/calendar/components/Calendar.tsx
import { useMemo } from 'react';
import { toLocalDateString } from '@/shared/lib/date';
import { useAllExams } from '@/features/exam/hooks/useAllExams';
import { useTodos } from '@/features/todo/hooks/useTodos';
import { examName } from '@/features/exam/lib/examName';
import { todoName } from '@/features/todo/lib/todoName';
import { buildMonthGrid } from '@/features/calendar/lib/month';
import { useCalendarMonth } from '@/features/calendar/hooks/useCalendarMonth';
import { CalendarCell, type ScheduleItem } from './CalendarCell';

// 일요일 시작. 시안 헤더는 MON…SUN이지만 팀 결정으로 일요일 시작을 쓴다.
// buildMonthGrid의 leading 계산도 같은 기준이라 한쪽만 바꾸면 날짜가 요일과 어긋난다.
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

export function Calendar() {
  const { year, month, goPrev, goNext } = useCalendarMonth();
  const { data: exams } = useAllExams();
  const { data: todos } = useTodos();

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  // 날짜를 키로 Map을 만들어 42개 칸이 각각 O(1)로 꺼내 쓴다.
  // 한 칸에서 시험이 투두보다 위에 오도록 시험을 먼저 넣는다.
  const scheduleByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    const push = (dateStr: string, item: ScheduleItem) => {
      const list = map.get(dateStr);
      if (list) list.push(item);
      else map.set(dateStr, [item]);
    };
    exams?.forEach((exam) =>
      push(exam.examDate, {
        id: `exam-${exam.examId}`,
        type: 'exam',
        label: examName(exam),
      }),
    );
    todos?.forEach((todo) =>
      push(todo.dueDate, {
        id: `todo-${todo.todoId}`,
        type: 'todo',
        label: todoName(todo),
      }),
    );
    return map;
  }, [exams, todos]);

  // "오늘"은 보는 사람 기준이라 렌더 시 계산한다.
  const todayStr = toLocalDateString(new Date());

  return (
    <section className="flex min-h-0 flex-col">
      {/* 제목 행은 시험 일정·TODO 열과 같은 규칙 — leading-7(28) + mb-1.5(6).
          셋 다 같은 text-[18px] 제목이라 줄높이와 간격이 어긋나면 나란히 놓였을 때 바로 보인다. */}
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-[18px] leading-7 font-medium tracking-[-0.36px] text-gray-950">
          캘린더
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[18px] leading-7 font-medium tracking-[-0.36px] text-gray-950">
            {year}년 {month}월
          </span>
          <NavButton label="이전 달" onClick={goPrev} direction="left" />
          <NavButton label="다음 달" onClick={goNext} direction="right" />
        </div>
      </div>

      {/* 카드 높이를 고정한다. 예전에는 flex-1로 남는 높이를 채웠는데, 그러면 행 높이가
          뷰포트에 따라 소수점(111.33px)이 되고 그 값이 디바이스 픽셀로 반올림되면서
          격자선이 111/112px로 번갈아 찍혀 행이 들쭉날쭉해 보였다.
          653 = 테두리 2 + 요일행 27 + 분리선 1 + 날짜 그리드 623.
          시안 652보다 1px 큰데, 6행이 정수(103px)로 떨어지는 가장 가까운 값이라 이쪽을 택했다. */}
      <div className="flex flex-col overflow-hidden rounded-md border border-gray-300 lg:h-[653px]">
        {/* 요일 행과 날짜 그리드를 같은 grid-cols-7로 두어 열을 정렬한다.
            gap-px + 배경 gray-300으로 칸 사이 격자선을 만든다. */}
        {/* 요일행 27px = 시안 28.55. leading을 명시하지 않으면 부모에서 상속된
            24px 줄높이(strut)가 행을 32px로 부풀린다. */}
        <div className="grid shrink-0 grid-cols-7 gap-px border-b border-gray-300 bg-gray-300">
          {WEEKDAYS.map((label) => (
            <div key={label} className="bg-white px-2 py-[7.5px]">
              <span className="block text-[10px] leading-3 font-medium text-gray-900">
                {label}
              </span>
            </div>
          ))}
        </div>
        {/* 6주 그리드. 높이를 623으로 고정해 repeat(6,1fr)이 정확히 103px씩 떨어지게 한다
            (623 = 6 × 103 + 5 × gap-px). 소수점 행 높이가 사라져 격자선이 균등해진다.
            모바일은 기존 고정 높이(h-115)를 그대로 쓴다.
            내용이 줄 높이를 넘으면 셀의 overflow-hidden으로 잘린다(→ 태그는 셀에서 +N으로 접음). */}
        <div className="grid h-115 grid-cols-7 grid-rows-6 gap-px bg-gray-300 lg:h-[623px]">
          {cells.map((cell) => (
            <CalendarCell
              key={cell.dateStr}
              cell={cell}
              items={scheduleByDate.get(cell.dateStr) ?? []}
              isToday={cell.dateStr === todayStr}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <LegendTag className="bg-secondary-100 text-secondary-500">
          할 일 (TODO)
        </LegendTag>
        <LegendTag className="bg-level-02/30 text-warning">시험 일정</LegendTag>
      </div>
    </section>
  );
}

function NavButton({
  label,
  onClick,
  direction,
}: {
  label: string;
  onClick: () => void;
  direction: 'left' | 'right';
}) {
  // 버튼 21px·radius 6px은 시안값 그대로다. 옆의 "YYYY년 M월"(18px)도 시안 크기를
  // 그대로 쓰므로 버튼만 0.72로 줄이면 글자보다 작아져 시안과 어긋난다.
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-5.25 items-center justify-center rounded-md bg-gray-800 text-white transition-colors hover:bg-gray-900"
    >
      <ChevronIcon
        className={direction === 'left' ? 'size-5 rotate-180' : 'size-5'}
      />
    </button>
  );
}

function LegendTag({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    // 시안 범례 pill은 57×15로 셀 안 태그보다 작다. 글자 9px + px 4로 맞춘다.
    <span
      className={`rounded-full px-1 py-0.5 text-[9px] leading-3 font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
