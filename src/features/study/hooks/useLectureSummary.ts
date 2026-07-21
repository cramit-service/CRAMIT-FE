'use client';
// src/features/study/hooks/useLectureSummary.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getLectureSummary, updateLectureSummary } from '@/features/study/api';
import type { LectureSummary } from '@/shared/types/api';

// 저장 후 캐시를 직접 덮어써야 해서 키를 한 곳에서 만든다 (조회/저장이 어긋나지 않게)
const summaryKey = (chapterId: string) => ['lecture-summary', chapterId];

// AI 강의 요약(Markdown 원문) 조회 훅
export function useLectureSummary(chapterId: string) {
  return useQuery({
    queryKey: summaryKey(chapterId),
    // TanStack Query가 주는 signal을 fetcher까지 전달해 취소된 요청을 끊는다.
    queryFn: ({ signal }) => getLectureSummary(chapterId, signal),
  });
}

// 요약 수정 저장 훅.
// TODO(백엔드): 저장 API가 아직 없다. 지금은 응답을 쿼리 캐시에 덮어써서 화면에만 반영되고,
//               새로고침하면 mock 원문으로 되돌아간다. 실제 API가 붙으면 invalidate로 바꾼다.
export function useUpdateLectureSummary(chapterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (markdown: string) => updateLectureSummary(chapterId, markdown),
    onSuccess: (saved) => {
      queryClient.setQueryData<LectureSummary>(summaryKey(chapterId), saved);
    },
  });
}
