'use client';
// src/features/exam/hooks/useCreateExam.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateExamRequest } from '@/shared/types/api';
import { createExam } from '@/features/exam/api';

// 시험 일정 생성 훅.
export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateExamRequest>({
    mutationFn: (req) => createExam(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}
