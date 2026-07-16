// src/shared/hooks/useProcessStatus.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { ProcessStatus } from '@/shared/types/api';

interface UseProcessStatusOptions {
  // 상태를 조회하는 함수 (각 기능이 자기 status API를 넘김)
  queryKey: string[];
  fetchStatus: () => Promise<ProcessStatus>;
  // 폴링을 켤지 여부 (예: 요약 생성 요청을 보낸 뒤에만 true)
  enabled: boolean;
}

export function useProcessStatus({
  queryKey,
  fetchStatus,
  enabled,
}: UseProcessStatusOptions) {
  const query = useQuery({
    queryKey,
    queryFn: fetchStatus,
    enabled, // enabled가 true일 때만 폴링 시작
    // PROCESSING이면 2초마다 재조회, READY면 폴링 중단
    refetchInterval: (query) => {
      const status = query.state.data;
      return status === 'PROCESSING' ? 2000 : false;
    },
  });

  return {
    status: query.data, // 'READY' | 'PROCESSING' | undefined
    isProcessing: query.data === 'PROCESSING',
    isReady: query.data === 'READY',
    isLoading: query.isLoading,
    error: query.error,
  };
}
