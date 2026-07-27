// src/features/calendar/lib/month.ts
// 달력 그리드 계산. "며칠이 무슨 요일 칸에 오는가"는 순수 계산이라
// 화면과 분리해 여기 두고 단독으로 검증할 수 있게 한다.
import { toLocalDateString } from '@/shared/lib/date';

export interface CalendarCell {
  dateStr: string; // 'YYYY-MM-DD' — 일정 매핑 키로 그대로 쓴다
  day: number; // 1~31 (셀에 표시할 날짜 숫자)
  isCurrentMonth: boolean; // false면 앞뒤 달의 채움 날짜(흐리게 표시)
}

// year, month(1~12)의 달력을 6주 = 42칸으로 만든다. 일요일 시작.
// 항상 42칸으로 고정해 달마다 그리드 높이가 들쭉날쭉하지 않게 한다.
export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  // Date는 month를 0~11로 다루므로 1일을 만들 때 month-1.
  const firstOfMonth = new Date(year, month - 1, 1);
  // 1일의 요일(0=일 ~ 6=토). 일요일 시작이라 이 값이 곧 앞쪽 채움 칸 수가 된다.
  const leading = firstOfMonth.getDay();
  // 첫 칸 = 1일에서 leading일만큼 뒤로 물러난 날(=이전 달 말일들).
  // Date가 음수 날짜를 알아서 이전 달로 넘겨준다.
  const start = new Date(year, month - 1, 1 - leading);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
    );
    cells.push({
      dateStr: toLocalDateString(d),
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === month - 1,
    });
  }
  return cells;
}
