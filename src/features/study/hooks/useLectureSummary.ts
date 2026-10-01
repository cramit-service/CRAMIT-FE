'use client';
// src/features/study/hooks/useLectureSummary.ts
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLectureSummary,
  getLectureSummaryStatus,
  updateLectureSummary,
} from '@/features/study/api';
import { useProcessStatus } from '@/shared/hooks/useProcessStatus';
import type { LectureSummary } from '@/shared/types/api';

// 저장 후 캐시를 직접 덮어써야 해서 키를 한 곳에서 만든다 (조회/저장이 어긋나지 않게)
const summaryKey = (chapterId: string) => ['lecture-summary', chapterId];

// AI 강의 요약 조회 훅.
// 요약 생성은 비동기라 /status를 공통 훅으로 폴링하고, READY가 되면 본문을 다시 가져온다.
// 그래야 탭을 열어둔 채 생성이 끝나도 화면이 저절로 채워진다.
export function useLectureSummary(chapterId: string) {
  const queryClient = useQueryClient();

  const { status, isProcessing } = useProcessStatus({
    queryKey: ['lecture-summary-status', chapterId],
    fetchStatus: (signal) => getLectureSummaryStatus(chapterId, signal),
    enabled: Boolean(chapterId),
  });

  const summaryQuery = useQuery({
    queryKey: summaryKey(chapterId),
    // TanStack Query가 주는 signal을 fetcher까지 전달해 취소된 요청을 끊는다.
    queryFn: ({ signal }) => getLectureSummary(chapterId, signal),
    // 생성 중에는 받아올 본문이 없으니 요청 자체를 하지 않는다
    enabled: status === 'READY',
  });

  // PROCESSING -> READY로 바뀐 순간 본문을 새로 가져온다
  useEffect(() => {
    if (status === 'READY') {
      queryClient.invalidateQueries({ queryKey: summaryKey(chapterId) });
    }
  }, [status, chapterId, queryClient]);

  return { ...summaryQuery, isProcessing, status };
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
