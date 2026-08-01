'use client';
// src/features/calendar/hooks/useCalendarMonth.ts
import { useState } from 'react';

// month는 1~12로 다룬다. (Date의 0~11과 헷갈리지 않도록 훅 경계에서 변환)
export function useCalendarMonth() {
  const today = new Date();
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });

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
