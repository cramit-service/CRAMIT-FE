'use client';
// src/features/exam/hooks/useUpdateExam.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Exam, UpdateExamRequest } from '@/shared/types/api';
import { updateExam } from '../api';

// 시험 일정 수정 훅. 무효화 범위는 생성과 같다(useCreateExam 주석 참고).
export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation<Exam, Error, UpdateExamRequest>({
    mutationFn: (req) => updateExam(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}
