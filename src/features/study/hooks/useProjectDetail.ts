'use client';
// src/features/study/hooks/useProjectDetail.ts
import { useQuery } from '@tanstack/react-query';
import { getProjectDetail } from '@/features/study/api';

// 프로젝트 상세(헤더 메타) 조회 훅
export function useProjectDetail(projectId: string) {
  return useQuery({
    queryKey: ['project-detail', projectId],
    // TanStack Query가 주는 signal을 fetcher까지 전달해 취소된 요청을 끊는다.
    queryFn: ({ signal }) => getProjectDetail(projectId, signal),
  });
}
