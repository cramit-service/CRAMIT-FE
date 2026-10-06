// src/shared/lib/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiRequestError } from '@/shared/lib/apiClient';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // QueryClient를 컴포넌트 안에서 생성 (useState로 한 번만 만들어지게)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1분간 데이터를 "신선"하게 취급 (불필요한 재요청 방지)
            // 실패 시 1번만 재시도. 다시 보내도 나아지지 않는 것은 뺀다 —
            // 타임아웃은 또 15초를 기다리게 되고, 4xx는 서버가 같은 답을 준다.
            retry: (failureCount, error) =>
              failureCount < 1 &&
              !(
                error instanceof ApiRequestError &&
                (error.code === 'TIMEOUT' ||
                  (error.status >= 400 && error.status < 500))
              ),
            refetchOnWindowFocus: false, // 창 포커스 시 자동 재요청 끔 (개발 중 성가심 방지)
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
