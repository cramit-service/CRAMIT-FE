'use client';
// src/features/project/hooks/useCreateChapter.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Chapter, CreateChapterRequest } from '@/shared/types/api';
import { createChapter } from '../api';

// 새 주차(챕터) 업로드 훅.
// 성공하면 올린 강의의 챕터 목록과 헤더 메타("강의 N개")를 다시 불러온다.
export function useCreateChapter() {
  const queryClient = useQueryClient();

  return useMutation<Chapter, Error, CreateChapterRequest>({
    mutationFn: (req) => createChapter(req),
    onSuccess: (_chapter, req) => {
      queryClient.invalidateQueries({ queryKey: ['chapters', req.projectId] });
      queryClient.invalidateQueries({
        queryKey: ['project-detail', req.projectId],
      });
    },
  });
}
