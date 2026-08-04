'use client';
// src/features/project/hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../api';

// 내 프로젝트(강의) 목록 조회 훅
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });
}
