'use client';
// src/features/project/hooks/useCreateChapter.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Chapter, CreateChapterRequest } from '@/shared/types/api';
import type { UploadOptions } from '@/shared/lib/apiClient';
import { createChapter } from '@/features/project/api';

// 진행률·취소는 요청 본문이 아니라 전송 방식이라 payload와 함께 받되 폼 데이터에서는 떼어낸다.
export type CreateChapterVariables = CreateChapterRequest & UploadOptions;

// 새 주차(챕터) 업로드 훅.
// 성공하면 챕터 수가 달라지므로 그 숫자를 보여주는 곳을 모두 다시 불러온다.
// (상세 헤더의 "강의 N개" 태그, 학습하기 목록 카드의 같은 태그)
export function useCreateChapter() {
  const queryClient = useQueryClient();

  return useMutation<Chapter, Error, CreateChapterVariables>({
    mutationFn: ({ onProgress, signal, ...req }) =>
      createChapter(req, { onProgress, signal }),
    onSuccess: (_chapter, req) => {
      queryClient.invalidateQueries({ queryKey: ['chapters', req.projectId] });
      queryClient.invalidateQueries({
        queryKey: ['project-detail', req.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['project-summaries'] });
    },
  });
}
