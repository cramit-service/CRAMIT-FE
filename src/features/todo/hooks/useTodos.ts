'use client';
// src/features/todo/hooks/useTodos.ts
import { useQuery } from '@tanstack/react-query';
import { getTodos } from '@/features/todo/api';

// 내 전체 TODO 조회 훅. 홈 캘린더가 dueDate 기준으로 칸에 뿌린다.
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: ({ signal }) => getTodos(signal),
  });
}
