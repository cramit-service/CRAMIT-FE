'use client';
// src/features/calendar/components/Calendar.tsx
import { useMemo } from 'react';
import { toLocalDateString } from '@/shared/lib/date';
import { useTodos } from '@/features/todo/hooks/useTodos';
import { useTodoFilter } from '@/features/todo/hooks/useTodoFilter';
import { buildMonthGrid } from '@/features/calendar/lib/month';
import { buildSubjectColorMap } from '@/shared/lib/subjectColor';
import { useProjectSummaries } from '@/features/study/hooks/useProjectSummaries';
import { useCalendarMonth } from '@/features/calendar/hooks/useCalendarMonth';
import { CalendarCell, type ScheduleItem } from './CalendarCell';
import { IconButton } from '@/shared/ui/IconButton';

// 일요일 시작. 시안 헤더는 MON…SUN이지만 팀 결정으로 일요일 시작을 쓴다.
// buildMonthGrid의 leading 계산도 같은 기준이라 한쪽만 바꾸면 날짜가 요일과 어긋난다.
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

export function Calendar() {
  const { year, month, goPrev, goNext } = useCalendarMonth();
  const { data: todos } = useTodos();
  const { data: projects } = useProjectSummaries();
  const { filter, toggleDate } = useTodoFilter();

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  // 사이드바 강의 점과 같은 색이어야 하므로 배정 규칙을 공용 함수에 맡긴다.
  const subjectDots = useMemo(() => buildSubjectColorMap(projects), [projects]);

  // 날짜를 키로 Map을 만들어 42개 칸이 각각 O(1)로 꺼내 쓴다.
  // 캘린더에 뜨는 건 할 일뿐이다 — 시험을 달력에 어떻게 표시할지는 따로 정한다.
  // 전에는 시험도 같은 줄로 들어가 있었고, 링과 굵은 글자로만 구분됐다.
  const scheduleByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    todos?.forEach((todo) => {
      const item: ScheduleItem = {
        id: todo.todoId,
        subjectId: todo.projectId,
        label: todo.title,
      };
      const list = map.get(todo.dueDate);
      if (list) list.push(item);
      else map.set(todo.dueDate, [item]);
    });
    return map;
  }, [todos]);

  // "오늘"은 보는 사람 기준이라 렌더 시 계산한다.
  const todayStr = toLocalDateString(new Date());

  return (
    <section className="flex min-h-0 flex-col">
      {/* 제목 행은 시험 일정·TODO 열과 같은 규칙 — text-body-md(20/30) + mb-2(8).
          셋 다 같은 제목 단이라 줄높이와 간격이 어긋나면 나란히 놓였을 때 바로 보인다. */}
      {/* 머리줄 높이를 시험 일정·TODO와 같은 40으로 맞춘다. 전에는 월 이동 버튼이
          21이라 이 줄만 30이었고, 그만큼 캘린더 카드가 옆 TODO 카드보다 10px 위에 떠 있었다.
          (주석은 "두 열의 제목 행 규칙이 같다"고 적어 뒀지만 실제로는 아니었다.) */}
      <div className="mb-2 flex min-h-10 items-center justify-between">
        <h2 className="text-body-md font-semibold text-gray-800">캘린더</h2>
        <div className="flex items-center gap-2">
          {/* 제목과 같은 칸(20)이다. 18은 §3이 "제목이 아닌 본문"에 준 단이라
              제목 옆에 서면 둘의 관계가 읽히지 않았다. */}
          <span className="text-body-md font-medium text-gray-800">
            {year}년 {month}월
          </span>
          <IconButton
            name="arrow-left"
            aria-label="이전 달"
            rank="plain"
            onClick={goPrev}
          />
          <IconButton
            name="arrow-right"
            aria-label="다음 달"
            rank="plain"
            onClick={goNext}
          />
        </div>
      </div>

      {/* 카드 높이 654는 옆 TODO 카드와 하단을 맞추기 위한 값이라 그대로 둔다.
          안쪽 배분: 테두리 2 + 패딩 16/16 + 요일행 16 + 그 아래 8 = 58, 남는 596이 날짜 격자다.
          596 = 셀 96 × 6 + 행 간격 4 × 5 — 전부 §2 간격 목록 위의 값이고 정수로 떨어진다.
          떨어지지 않으면 셀 상단 선이 디바이스 픽셀에서 반올림되며 들쭉날쭉해 보인다.
          셀 96이 일정 두 줄 + "+N"을 담는 최소값이다(CalendarCell). */}
      <div className="bg-surface rounded-md border border-gray-100 px-5 py-4 lg:h-[654px]">
        {/* 요일 머리글. 배경·구분선 없이 글자만 둔다 — 격자선은 셀이 각자 위에 긋는다. */}
        <div className="mb-2 grid grid-cols-7 gap-x-1">
          {WEEKDAYS.map((label) => (
            <span
              key={label}
              className="text-label/4 px-2 font-medium text-gray-500"
            >
              {label}
            </span>
          ))}
        </div>
        {/* 6주 격자. 세로 구분선을 걷어내고 셀마다 위쪽 선만 그어 가볍게 만든다. */}
        <div className="grid grid-cols-7 grid-rows-6 gap-x-1 gap-y-1 lg:h-[596px]">
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
