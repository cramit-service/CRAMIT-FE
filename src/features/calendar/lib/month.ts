// src/features/calendar/lib/month.ts
import { toLocalDateString } from '@/shared/lib/date';

export interface CalendarCell {
  dateStr: string; // 'YYYY-MM-DD' — 일정 매핑 키로 그대로 쓴다
  day: number; // 1~31 (셀에 표시할 날짜 숫자)
  isCurrentMonth: boolean; // false면 앞뒤 달의 채움 날짜(흐리게 표시)
}

// year, month(1~12)의 달력을 6주 = 42칸으로 만든다. 시안대로 월요일 시작.
// 항상 42칸으로 고정해 달마다 그리드 높이가 들쭉날쭉하지 않게 한다.
export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const firstOfMonth = new Date(year, month - 1, 1);
  // getDay()는 0=일 ~ 6=토다. 월요일 시작이라 일요일(0)을 주의 마지막(6)으로 옮긴다.
  const leading = (firstOfMonth.getDay() + 6) % 7;
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
