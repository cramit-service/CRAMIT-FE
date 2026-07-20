'use client';
// src/features/study/hooks/useProjectDetail.ts
import { useQuery } from '@tanstack/react-query';
import { getProjectDetail } from '../api';

// 프로젝트 상세(헤더 메타) 조회 훅
export function useProjectDetail(projectId: string) {
  return useQuery({
    queryKey: ['project-detail', projectId],
    queryFn: () => getProjectDetail(projectId),
  });
}
