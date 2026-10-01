'use client';
// src/features/study/hooks/useChapters.ts
import { useQuery } from '@tanstack/react-query';
import { getChapters } from '@/features/study/api';

// 챕터(단계별 학습) 목록 조회 훅
export function useChapters(projectId: string) {
  return useQuery({
    queryKey: ['chapters', projectId],
    // TanStack Query가 주는 signal을 fetcher까지 전달해 취소된 요청을 끊는다.
    queryFn: ({ signal }) => getChapters(projectId, signal),
    // 강의를 아직 안 고른 화면(TODO 모달의 "연결된 주차")에서도 이 훅을 쓴다.
    // 빈 id로 부르면 의미 없는 요청이 나가고 그 결과가 ['chapters', '']에 캐시된다.
    enabled: projectId !== '',
  });
}
