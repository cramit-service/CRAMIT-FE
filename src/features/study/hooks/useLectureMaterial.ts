'use client';
// src/features/study/hooks/useLectureMaterial.ts
import { useQuery } from '@tanstack/react-query';
import { getChapter, getLectureMaterial } from '@/features/study/api';

// 학습 뷰어 헤더용 챕터 단건 조회 훅
export function useChapter(projectId: string, chapterId: string) {
  return useQuery({
    queryKey: ['chapter', projectId, chapterId],
    // TanStack Query가 주는 signal을 fetcher까지 전달해 취소된 요청을 끊는다.
    queryFn: ({ signal }) => getChapter(projectId, chapterId, signal),
  });
}

// 강의자료(PDF 페이지 수·녹음 길이) 조회 훅
export function useLectureMaterial(chapterId: string) {
  return useQuery({
    queryKey: ['lecture-material', chapterId],
    queryFn: ({ signal }) => getLectureMaterial(chapterId, signal),
  });
}
