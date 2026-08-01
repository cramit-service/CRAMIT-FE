// src/features/todo/api.ts
import type { Todo } from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import { mockTodos } from '@/mocks/todo';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = true;

// 쿼리가 취소되면 실제 fetch처럼 즉시 중단되도록 AbortSignal을 받는다. (study/api.ts와 동일 패턴)
const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

// 내 전체 TODO 조회 — 홈 캘린더용.
// 캘린더는 dueDate 기준으로 달력 칸에 뿌리므로 여기선 거르지 않고 전부 준다.
export async function getTodos(signal?: AbortSignal): Promise<Todo[]> {
  if (USE_MOCK) {
    await delay(300, signal);
    return mockTodos;
  }
  return apiClient.get<Todo[]>('/todos', { signal });
}
