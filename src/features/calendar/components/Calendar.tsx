'use client';
// src/features/calendar/components/Calendar.tsx
import { useMemo } from 'react';
import { toLocalDateString } from '@/shared/lib/date';
import { useAllExams } from '@/features/exam/hooks/useAllExams';
import { useTodos } from '@/features/todo/hooks/useTodos';
import { examName } from '@/features/exam/lib/examName';
import { todoName } from '@/features/todo/lib/todoName';
import { useTodoFilter } from '@/features/todo/hooks/useTodoFilter';
import { buildMonthGrid } from '@/features/calendar/lib/month';
import {
  buildSubjectDotMap,
  subjectIdsInCreationOrder,
} from '@/shared/lib/subjectColor';
import { useProjectSummaries } from '@/features/study/hooks/useProjectSummaries';
import { useCalendarMonth } from '@/features/calendar/hooks/useCalendarMonth';
import { CalendarCell, type ScheduleItem } from './CalendarCell';

// 일요일 시작. 시안 헤더는 MON…SUN이지만 팀 결정으로 일요일 시작을 쓴다.
// buildMonthGrid의 leading 계산도 같은 기준이라 한쪽만 바꾸면 날짜가 요일과 어긋난다.
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

export function Calendar() {
  const { year, month, goPrev, goNext } = useCalendarMonth();
  const { data: exams } = useAllExams();
  const { data: todos } = useTodos();
  const { data: projects } = useProjectSummaries();
  const { filter, toggleDate } = useTodoFilter();

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  // 사이드바 강의 점과 같은 색이어야 하므로 배정 규칙을 공용 함수에 맡긴다.
  const subjectDots = useMemo(
    () => buildSubjectDotMap(subjectIdsInCreationOrder(projects)),
    [projects],
  );

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
        subjectId: exam.projectId,
        label: examName(exam),
      }),
    );
    todos?.forEach((todo) =>
      push(todo.dueDate, {
        id: `todo-${todo.todoId}`,
        type: 'todo',
        subjectId: todo.projectId,
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
          셋 다 같은 text-body 제목이라 줄높이와 간격이 어긋나면 나란히 놓였을 때 바로 보인다. */}
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-body font-medium text-gray-950">캘린더</h2>
        <div className="flex items-center gap-2">
          <span className="text-body font-medium text-gray-950">
            {year}년 {month}월
          </span>
          <NavButton label="이전 달" onClick={goPrev} direction="left" />
          <NavButton label="다음 달" onClick={goNext} direction="right" />
        </div>
      </div>

      {/* 카드 높이 654는 옆 TODO 카드와 하단을 맞추기 위한 값이라 그대로 둔다.
          안쪽 배분: 테두리 2 + 패딩 16/12 + 요일행 16 + 그 아래 10 = 56, 남는 598이 날짜 격자다.
          598을 고정해야 6행이 98px로 정확히 떨어진다 — 비워 두면 행 높이가 소수점이 되고
          셀 상단 선이 디바이스 픽셀에서 반올림되며 들쭉날쭉해 보인다. */}
      <div className="rounded-lg border border-gray-300 bg-white px-5 pt-4 pb-3 lg:h-[654px]">
        {/* 요일 머리글. 배경·구분선 없이 글자만 둔다 — 격자선은 셀이 각자 위에 긋는다. */}
        <div className="mb-2.5 grid grid-cols-7 gap-x-1">
          {WEEKDAYS.map((label) => (
            <span
              key={label}
              className="px-1.5 text-[12px] leading-4 font-medium text-gray-500"
            >
              {label}
            </span>
          ))}
        </div>
        {/* 6주 격자. 세로 구분선을 걷어내고 셀마다 위쪽 선만 그어 가볍게 만든다. */}
        <div className="grid grid-cols-7 grid-rows-6 gap-x-1 gap-y-0.5 lg:h-[598px]">
          {cells.map((cell) => (
            <CalendarCell
              key={cell.dateStr}
              cell={cell}
              items={scheduleByDate.get(cell.dateStr) ?? []}
              isToday={cell.dateStr === todayStr}
              isSelected={
                filter.kind === 'date' && filter.date === cell.dateStr
              }
              onSelect={() => toggleDate(cell.dateStr)}
              subjectDots={subjectDots}
            />
          ))}
        </div>
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
