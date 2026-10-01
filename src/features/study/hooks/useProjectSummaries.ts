'use client';
// src/features/study/hooks/useProjectSummaries.ts
import { useQuery } from '@tanstack/react-query';
import { getProjectSummaries } from '@/features/study/api';

// 학습하기(강의 목록) 조회 훅
export function useProjectSummaries() {
  return useQuery({
    queryKey: ['project-summaries'],
    // TanStack Query가 주는 signal을 fetcher까지 전달해 취소된 요청을 끊는다.
    queryFn: ({ signal }) => getProjectSummaries(signal),
  });
}
