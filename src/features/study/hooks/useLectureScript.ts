'use client';
// src/features/study/hooks/useLectureScript.ts
import { useQuery } from '@tanstack/react-query';
import { getLectureScript } from '@/features/study/api';

// 원문 스크립트(STT) 조회 훅.
// 스크립트는 이 탭에서만 쓰므로 화면 진입이 아니라 탭 안에서 조회한다(요약 탭과 같은 방식).
export function useLectureScript(chapterId: string) {
  return useQuery({
    queryKey: ['lecture-script', chapterId],
    // TanStack Query가 주는 signal을 fetcher까지 전달해 취소된 요청을 끊는다.
    queryFn: ({ signal }) => getLectureScript(chapterId, signal),
  });
}
