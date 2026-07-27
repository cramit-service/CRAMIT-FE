'use client';
// src/features/exam/hooks/useExams.ts
import { useQuery } from '@tanstack/react-query';
import { getExams } from '../api';

// getExams가 이미 "다가오는 것만 + 정렬"까지 해서 주므로, 화면은 그대로 그리기만 하면 된다.
export function useExams() {
  return useQuery({
    queryKey: ['exams'],
    queryFn: ({ signal }) => getExams(signal),
  });
}
