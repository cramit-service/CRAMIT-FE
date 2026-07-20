'use client';
// src/features/study/hooks/useChapters.ts
import { useQuery } from '@tanstack/react-query';
import { getChapters } from '../api';

// 챕터(단계별 학습) 목록 조회 훅
export function useChapters(projectId: string) {
  return useQuery({
    queryKey: ['chapters', projectId],
    // TanStack Query가 주는 signal을 fetcher까지 전달해 취소된 요청을 끊는다.
    queryFn: ({ signal }) => getChapters(projectId, signal),
  });
}
