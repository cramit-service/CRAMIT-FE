'use client';
// src/features/project/hooks/useLectureMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/shared/types/api';
import {
  createLecture,
  deleteLecture,
  updateLecture,
} from '@/features/project/api';

// 강의가 바뀌면 학습하기 목록 카드와 모달의 강의 셀렉트가 함께 바뀐다 — 둘 다
// ['project-summaries']를 본다. ['project-detail']은 상세 헤더.
function useInvalidateLectures() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['project-summaries'] });
    queryClient.invalidateQueries({ queryKey: ['project-detail'] });
  };
}

export function useCreateLecture() {
  const invalidate = useInvalidateLectures();
  return useMutation<void, Error, CreateProjectRequest>({
    mutationFn: createLecture,
    onSuccess: invalidate,
  });
}

export function useUpdateLecture() {
  const invalidate = useInvalidateLectures();
  return useMutation<void, Error, UpdateProjectRequest>({
    mutationFn: updateLecture,
    onSuccess: invalidate,
  });
}

export function useDeleteLecture() {
  const invalidate = useInvalidateLectures();
  return useMutation<void, Error, number>({
    mutationFn: deleteLecture,
    onSuccess: invalidate,
  });
}
