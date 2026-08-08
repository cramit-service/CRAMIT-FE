'use client';
// src/features/exam/hooks/useCreateExam.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateExamRequest, Exam } from '@/shared/types/api';
import { createExam } from '../api';

// 시험 일정 생성 훅.
// ['exams'] 하나만 무효화하면 캘린더의 ['exams', 'all']까지 함께 무효화된다.
// TanStack Query가 쿼리 키를 앞에서부터 부분 일치로 보기 때문이라 두 줄 쓸 필요가 없다.
export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation<Exam, Error, CreateExamRequest>({
    mutationFn: (req) => createExam(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}
