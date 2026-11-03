'use client';
// src/features/exam/hooks/useDeleteExam.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteExam } from '@/features/exam/api';

// 시험 일정 삭제 훅.
export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (examId) => deleteExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}
