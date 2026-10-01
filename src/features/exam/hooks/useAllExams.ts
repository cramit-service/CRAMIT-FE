'use client';
// src/features/exam/hooks/useAllExams.ts
import { useQuery } from '@tanstack/react-query';
import { getAllExams } from '@/features/exam/api';

// 캘린더용 — 과거 포함 전체 시험 조회. 다가오는 것만 필요한 곳은 useExams를 쓴다.
export function useAllExams() {
  return useQuery({
    queryKey: ['exams', 'all'],
    queryFn: ({ signal }) => getAllExams(signal),
  });
}
