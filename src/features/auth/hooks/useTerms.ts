'use client';
// src/features/auth/hooks/useTerms.ts
import { useQuery } from '@tanstack/react-query';
import { getTerms } from '@/features/auth/api';

export function useTerms() {
  return useQuery({
    queryKey: ['terms'],
    queryFn: ({ signal }) => getTerms(signal),
  });
}
