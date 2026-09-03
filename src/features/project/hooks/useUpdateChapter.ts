'use client';
// src/features/project/hooks/useUpdateChapter.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Chapter, UpdateChapterRequest } from '@/shared/types/api';
import type { UploadOptions } from '@/shared/lib/apiClient';
import { updateChapter } from '@/features/project/api';

// 생성 훅과 같은 이유로 전송 옵션을 payload에 얹어 받는다.
export type UpdateChapterVariables = UpdateChapterRequest & UploadOptions;

// 주차(챕터) 수정 훅 — 주차 카드를 꾹 눌러 여는 "주차 정보 수정하기" 모달.
// 강의를 옮길 수 있어 옮기기 전/후 목록이 모두 달라진다. 두 곳을 함께 무효화한다.
export function useUpdateChapter(originProjectId: string) {
  const queryClient = useQueryClient();

  return useMutation<Chapter, Error, UpdateChapterVariables>({
    mutationFn: ({ onProgress, signal, ...req }) =>
      updateChapter(req, { onProgress, signal }),
    onSuccess: (_chapter, req) => {
      const projectIds = new Set([originProjectId, req.projectId]);
      projectIds.forEach((projectId) => {
        queryClient.invalidateQueries({ queryKey: ['chapters', projectId] });
        queryClient.invalidateQueries({
          queryKey: ['project-detail', projectId],
        });
      });
      queryClient.invalidateQueries({ queryKey: ['project-summaries'] });
    },
  });
}
