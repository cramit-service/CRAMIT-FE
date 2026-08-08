'use client';
// src/features/exam/hooks/useDeleteExam.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteExam } from '../api';

// 시험 일정 삭제 훅. 무효화 범위는 생성과 같다(useCreateExam 주석 참고).
export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (examId) => deleteExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}
