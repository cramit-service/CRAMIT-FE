'use client';
// src/features/calendar/hooks/useCalendarMonth.ts
import { useState } from 'react';

// 캘린더가 지금 보여주는 달({year, month})과 이전/다음 이동을 관리한다.
// 초깃값은 오늘이 속한 달.
export function useCalendarMonth() {
  const today = new Date();
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1, // 0~11 → 1~12
  });

  // 1월에서 이전으로 가면 전년 12월, 12월에서 다음으로 가면 다음해 1월로 넘긴다.
  const goPrev = () =>
    setCursor(({ year, month }) =>
      month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 },
    );
  const goNext = () =>
    setCursor(({ year, month }) =>
      month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 },
    );

  return { ...cursor, goPrev, goNext };
}
