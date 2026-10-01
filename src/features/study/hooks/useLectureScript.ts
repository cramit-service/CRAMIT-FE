'use client';
// src/features/study/hooks/useLectureScript.ts
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getLectureScript, getLectureScriptStatus } from '@/features/study/api';
import { useProcessStatus } from '@/shared/hooks/useProcessStatus';

// 조회 키를 한 곳에서 만든다 (READY로 바뀔 때 같은 키를 무효화해야 한다)
const scriptKey = (chapterId: string) => ['lecture-script', chapterId];

// 원문 스크립트(STT) 조회 훅.
// 스크립트는 이 탭에서만 쓰므로 화면 진입이 아니라 탭 안에서 조회한다(요약 탭과 같은 방식).
// STT 변환도 비동기라 /status를 공통 훅으로 폴링하고, READY가 되면 본문을 다시 가져온다.
// 이게 없으면 변환이 안 끝난 챕터에서 실제 오류와 구분 없이 "불러오지 못했습니다"만 뜬다.
export function useLectureScript(chapterId: string) {
  const queryClient = useQueryClient();

  const { status, isProcessing } = useProcessStatus({
    queryKey: ['lecture-script-status', chapterId],
    fetchStatus: (signal) => getLectureScriptStatus(chapterId, signal),
    enabled: Boolean(chapterId),
  });

  const scriptQuery = useQuery({
    queryKey: scriptKey(chapterId),
    // TanStack Query가 주는 signal을 fetcher까지 전달해 취소된 요청을 끊는다.
    queryFn: ({ signal }) => getLectureScript(chapterId, signal),
    // 변환 중에는 받아올 본문이 없으니 요청 자체를 하지 않는다
    enabled: status === 'READY',
  });

  // PROCESSING -> READY로 바뀐 순간 본문을 새로 가져온다
  useEffect(() => {
    if (status === 'READY') {
      queryClient.invalidateQueries({ queryKey: scriptKey(chapterId) });
    }
  }, [status, chapterId, queryClient]);

  return { ...scriptQuery, isProcessing, status };
}
