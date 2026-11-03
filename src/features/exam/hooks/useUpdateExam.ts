'use client';
// src/features/exam/hooks/useUpdateExam.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateExamRequest } from '@/shared/types/api';
import { updateExam } from '@/features/exam/api';

// 시험 일정 수정 훅. 무효화 범위는 생성과 같다.
export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateExamRequest>({
    mutationFn: (req) => updateExam(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['project-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['project-detail'] });
    },
  });
}
