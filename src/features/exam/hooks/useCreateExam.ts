'use client';
// src/features/exam/hooks/useCreateExam.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateExamRequest } from '@/shared/types/api';
import { createExam } from '@/features/exam/api';

// 시험 일정 생성 훅.
// 강의 목록·상세의 D-DAY가 시험을 붙여 만들어지므로 강의 조회도 함께 무효화한다.
export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateExamRequest>({
    mutationFn: (req) => createExam(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['project-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['project-detail'] });
    },
  });
}
