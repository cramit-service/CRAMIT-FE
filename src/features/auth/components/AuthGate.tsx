'use client';
// src/features/auth/components/AuthGate.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { refreshAccessToken } from '@/shared/lib/apiClient';
import { getAccessToken } from '@/shared/lib/authToken';

// accessToken이 localStorage에 있어 서버(proxy)에서는 판단할 수 없다. 그래서 브라우저에서 막는다.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const token = getAccessToken() ?? (await refreshAccessToken());
      if (cancelled) return;

      if (token) setIsAuthed(true);
      else router.replace('/login');
    };
    check();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return isAuthed ? children : null;
}
