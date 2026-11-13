// src/shared/hooks/useProcessStatus.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { ProcessStatus } from '@/shared/types/api';

interface UseProcessStatusOptions {
  queryKey: (string | number)[];
  // AbortSignal을 받도록 시그니처 변경 (지적 1)
  fetchStatus: (signal: AbortSignal) => Promise<ProcessStatus>;
  enabled: boolean;
  // NOT_STARTED에서 다시 묻는 간격. 기다리면 시작되는 작업(요약)만 폴링한다.
  notStartedInterval?: number | false;
}

export function useProcessStatus({
  queryKey,
  fetchStatus,
  enabled,
  notStartedInterval = 5000,
}: UseProcessStatusOptions) {
  const query = useQuery({
    queryKey,
    // TanStack Query가 주는 signal을 fetcher까지 전달 (지적 1)
    queryFn: ({ signal }) => fetchStatus(signal),
    enabled,
    // 상태 폴링은 항상 최신을 봐야 하므로 캐시를 신선하게 두지 않음 (지적 2)
    staleTime: 0,
    gcTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data;
      if (status === 'PROCESSING') return 2000;
      // STT가 끝나면 서버가 요약을 알아서 시작한다. 녹음 없는 주차는 계속 이 상태라 느리게 묻는다.
      return status === 'NOT_STARTED' ? notStartedInterval : false;
    },
  });

  return {
    status: query.data,
    isProcessing: query.data === 'PROCESSING',
    isReady: query.data === 'READY',
    isLoading: query.isLoading,
    error: query.error,
  };
}
