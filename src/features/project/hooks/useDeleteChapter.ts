'use client';
// src/features/project/hooks/useDeleteChapter.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteChapter } from '@/features/project/api';

// 주차를 지우면 서버가 그 주차에 연결된 TODO도 함께 지운다.
// 지운 주차 자체의 조회(['chapter', …])는 건드리지 않는다 — 아직 그 화면 위라 다시 불러오면 404가 잠깐 보인다.
export function useDeleteChapter(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', projectId] });
      queryClient.invalidateQueries({
        queryKey: ['project-detail', projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['project-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
