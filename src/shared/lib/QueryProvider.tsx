// src/shared/lib/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // QueryClient를 컴포넌트 안에서 생성 (useState로 한 번만 만들어지게)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1분간 데이터를 "신선"하게 취급 (불필요한 재요청 방지)
            retry: 1, // 실패 시 1번만 재시도
            refetchOnWindowFocus: false, // 창 포커스 시 자동 재요청 끔 (개발 중 성가심 방지)
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
