'use client';
// src/features/calendar/components/Calendar.tsx
import { useMemo } from 'react';
import { toLocalDateString } from '@/shared/lib/date';
import { useAllExams } from '@/features/exam/hooks/useAllExams';
import { useTodos } from '@/features/todo/hooks/useTodos';
import { examName } from '@/features/exam/lib/examName';
import { todoName } from '@/features/todo/lib/todoName';
import { buildMonthGrid } from '../lib/month';
import { useCalendarMonth } from '../hooks/useCalendarMonth';
import { CalendarCell, type ScheduleItem } from './CalendarCell';

// 요일 헤더. 일요일 시작.
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

export function Calendar() {
  const { year, month, goPrev, goNext } = useCalendarMonth();
  const { data: exams } = useAllExams();
  const { data: todos } = useTodos();

  // 표시 중인 달의 42칸. 달이 바뀔 때만 다시 만든다.
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  // 날짜별 일정 묶음. examDate/dueDate를 키로 Map을 만들어 각 칸에서 O(1)로 꺼낸다.
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

  // 오늘 날짜 문자열. "오늘"은 보는 사람 기준이라 렌더 시 계산한다.
  const todayStr = toLocalDateString(new Date());

  return (
    <section className="flex min-h-0 flex-col">
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-[18px] leading-7 font-medium tracking-[-0.36px] text-gray-950">
          캘린더
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-medium tracking-[-0.36px] text-gray-950">
            {year}년 {month}월
          </span>
          <NavButton label="이전 달" onClick={goPrev} direction="left" />
          <NavButton label="다음 달" onClick={goNext} direction="right" />
        </div>
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-gray-300 lg:flex-1">
        {/* 요일 행과 날짜 그리드를 같은 grid-cols-7로 두어 열을 정렬한다.
            gap-px + 배경 gray-300으로 칸 사이 격자선을 만든다. */}
        {/* 요일행: 날짜 그리드보다 낮게(Figma 28.55×0.72≈20px) + 아래 분리선(border-b)으로 날짜와 구분 */}
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-300">
          {WEEKDAYS.map((label) => (
            <div key={label} className="bg-white px-1.5 py-1">
              <span className="text-[10px] font-medium text-gray-900">
                {label}
              </span>
            </div>
          ))}
        </div>
        {/* 6주 그리드. 모바일은 고정 높이(h-115), lg 이상은 flex-1로 남는 높이를 채운다.
            grid-rows-6 = repeat(6, minmax(0,1fr))라 각 줄이 높이를 균등 분할하고,
            내용이 줄 높이를 넘으면 셀의 overflow-hidden으로 잘린다(→ 태그는 셀에서 +N으로 접음). */}
        <div className="grid h-115 grid-cols-7 grid-rows-6 gap-px bg-gray-300 lg:h-auto lg:min-h-0 lg:flex-1">
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

      {/* 범례: 태그 색이 무엇을 뜻하는지 */}
      <div className="mt-2.5 flex items-center gap-2">
        <LegendTag className="bg-secondary-100 text-secondary-500">
          할 일 (TODO)
        </LegendTag>
        <LegendTag className="bg-level-02/30 text-warning">시험 일정</LegendTag>
      </div>
    </section>
  );
}

// 월 이동 화살표 버튼. 디자인의 어두운 rounded 정사각 버튼.
function NavButton({
  label,
  onClick,
  direction,
}: {
  label: string;
  onClick: () => void;
  direction: 'left' | 'right';
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-3.75 items-center justify-center rounded-md bg-gray-800 text-white transition-colors hover:bg-gray-900"
    >
      <ChevronIcon
        className={direction === 'left' ? 'size-2.5 rotate-180' : 'size-2.5'}
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
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}
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
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
