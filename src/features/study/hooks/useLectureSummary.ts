'use client';
// src/features/study/hooks/useLectureSummary.ts
import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLectureSummary,
  getLectureSummaryStatus,
  updateLectureSummary,
} from '@/features/study/api';
import { useProcessStatus } from '@/shared/hooks/useProcessStatus';
import type { LectureSummary } from '@/shared/types/api';

// 저장 후 캐시를 직접 덮어써야 해서 키를 한 곳에서 만든다 (조회/저장이 어긋나지 않게)
const summaryKey = (chapterId: number) => ['lecture-summary', chapterId];
const statusKey = (chapterId: number) => ['lecture-summary-status', chapterId];

// AI 강의 요약 조회 훅.
// 요약 생성은 비동기라 /status를 공통 훅으로 폴링하고, READY가 되면 본문을 다시 가져온다.
// 그래야 탭을 열어둔 채 생성이 끝나도 화면이 저절로 채워진다.
export function useLectureSummary(chapterId: number) {
  const queryClient = useQueryClient();

  const {
    status,
    isProcessing,
    error: statusError,
  } = useProcessStatus({
    queryKey: statusKey(chapterId),
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

  // PROCESSING -> READY로 바뀐 순간에만 본문을 새로 가져온다. 상태 캐시는 마운트마다
  // 비어서(gcTime 0) 그냥 READY를 잡으면 탭을 열 때마다 신선한 본문을 다시 받는다.
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === 'PROCESSING' && status === 'READY') {
      queryClient.invalidateQueries({ queryKey: summaryKey(chapterId) });
    }
    prevStatus.current = status;
  }, [status, chapterId, queryClient]);

  // 상태와 본문 중 어느 쪽이 실패했든 둘 다 다시 묻는다.
  const retry = () => {
    queryClient.invalidateQueries({ queryKey: statusKey(chapterId) });
    queryClient.invalidateQueries({ queryKey: summaryKey(chapterId) });
  };

  // 쿼리 자체의 status와 헷갈리지 않게 처리 상태는 다른 이름으로 낸다.
  return {
    ...summaryQuery,
    // 조회가 실패해도 마지막 PROCESSING이 남는다. 그대로 두면 재시도 버튼 없이 "생성 중"에 멈춘다.
    isProcessing: isProcessing && !statusError,
    processStatus: status,
    statusError,
    retry,
  };
}

// 요약 수정 저장 훅.
// TODO(백엔드): 저장 API가 아직 없어 고친 내용은 캐시에만 남고, 새로고침하거나 캐시가
//               낡으면(1분) 서버 원문으로 돌아간다. 실제 API가 붙으면 invalidate로 바꾼다.
export function useUpdateLectureSummary(chapterId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (markdown: string) => updateLectureSummary(chapterId, markdown),
    onSuccess: (saved) => {
      queryClient.setQueryData<LectureSummary>(summaryKey(chapterId), saved);
    },
  });
}
