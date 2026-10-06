'use client';
// src/features/todo/hooks/useTodoMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTodoRequest, UpdateTodoRequest } from '@/shared/types/api';
import { createTodo, deleteTodo, updateTodo } from '@/features/todo/api';

// ['todos'] 하나를 홈 체크리스트와 캘린더가 함께 쓴다 — 한 번만 무효화하면 둘 다 따라온다.
function useInvalidateTodos() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  };
}

export function useCreateTodo() {
  const invalidate = useInvalidateTodos();
  return useMutation<void, Error, CreateTodoRequest>({
    mutationFn: createTodo,
    onSuccess: invalidate,
  });
}

export function useUpdateTodo() {
  const invalidate = useInvalidateTodos();
  return useMutation<void, Error, UpdateTodoRequest>({
    mutationFn: updateTodo,
    onSuccess: invalidate,
  });
}

export function useDeleteTodo() {
  const invalidate = useInvalidateTodos();
  return useMutation<void, Error, number>({
    mutationFn: deleteTodo,
    onSuccess: invalidate,
  });
}
