'use client';
// src/features/study/hooks/useChapters.ts
import { useQuery } from '@tanstack/react-query';
import { getChapters } from '../api';

// 챕터(단계별 학습) 목록 조회 훅
export function useChapters(projectId: string) {
  return useQuery({
    queryKey: ['chapters', projectId],
    queryFn: () => getChapters(projectId),
  });
}
