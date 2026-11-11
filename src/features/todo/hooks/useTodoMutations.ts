'use client';
// src/features/todo/hooks/useTodoMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTodoRequest, UpdateTodoRequest } from '@/shared/types/api';
import {
  createTodo,
  deleteTodo,
  toggleTodo,
  updateTodo,
} from '@/features/todo/api';

// ['todos'] 하나를 홈 체크리스트와 캘린더가 함께 쓴다 — 한 번만 무효화하면 둘 다 따라온다.
// 콜백이 Promise를 돌려주면 뮤테이션이 재조회까지 기다리므로, 기다릴 곳만 돌려준다.
function useInvalidateTodos() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['todos'] });
}

export function useCreateTodo() {
  const invalidate = useInvalidateTodos();
  return useMutation<void, Error, CreateTodoRequest>({
    mutationFn: createTodo,
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateTodo() {
  const invalidate = useInvalidateTodos();
  return useMutation<void, Error, UpdateTodoRequest>({
    mutationFn: updateTodo,
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteTodo() {
  const invalidate = useInvalidateTodos();
  return useMutation<void, Error, number>({
    mutationFn: deleteTodo,
    onSuccess: () => {
      invalidate();
    },
  });
}

// 체크는 재조회 값으로 그리므로 재조회까지 기다린다. 실패해도 다시 읽는다 —
// 응답만 놓치고 서버엔 저장됐을 수 있는데, 화면이 옛 값이면 다시 눌러 되돌리게 된다.
export function useToggleTodo() {
  const invalidate = useInvalidateTodos();
  return useMutation<void, Error, number>({
    mutationFn: toggleTodo,
    onSettled: invalidate,
  });
}
