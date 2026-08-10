// src/features/todo/api.ts
import type {
  CreateTodoRequest,
  Todo,
  UpdateTodoRequest,
} from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import {
  addMockTodo,
  mockTodos,
  removeMockTodo,
  updateMockTodo,
} from '@/mocks/todo';
import { mockProjectSummaries } from '@/mocks/project';

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
    // 원본 배열을 그대로 주면 안 된다. 추가·삭제가 이 배열을 직접 고치는데,
    // 캐시에 담긴 것도 같은 객체라 다시 조회해도 참조가 바뀌지 않는다.
    // TanStack Query는 참조가 같으면 갱신이 없다고 보고 화면을 다시 그리지 않는다.
    // 실제 서버도 매번 새 응답을 주므로 복사본이 맞는 흉내다.
    return [...mockTodos];
  }
  return apiClient.get<Todo[]>('/todos', { signal });
}

// 강의명은 서버가 projectId로 채워 내려주는 값이다. mock도 같은 자리에서 채운다. (exam/api.ts와 동일)
function mockLectureName(projectId: string | null): string | null {
  if (!projectId) return null;
  return (
    mockProjectSummaries.find((p) => p.projectId === projectId)?.title ?? null
  );
}

// TODO 추가 (Figma 1:1946)
// TODO: 백엔드 엔드포인트 확정 시 경로 재확인 필요
export async function createTodo(req: CreateTodoRequest): Promise<Todo> {
  if (USE_MOCK) {
    await delay(300);
    const todo: Todo = {
      todoId: `t${Date.now()}`,
      projectId: req.projectId,
      title: req.title,
      lectureName: mockLectureName(req.projectId),
      dueDate: req.dueDate,
      dueTime: req.dueTime,
      lectureId: req.lectureId,
      memo: req.memo,
      isCompleted: false,
    };
    addMockTodo(todo);
    return todo;
  }
  return apiClient.post<Todo>('/todos', req);
}

// TODO 수정 (Figma 1:2137)
export async function updateTodo(req: UpdateTodoRequest): Promise<Todo> {
  if (USE_MOCK) {
    await delay(300);
    const current = mockTodos.find((t) => t.todoId === req.todoId);
    if (!current) throw new Error('수정할 할 일을 찾지 못했어요.');
    // 완료 여부는 모달이 건드리지 않는다(체크박스가 따로 다룬다).
    const todo: Todo = {
      ...current,
      projectId: req.projectId,
      title: req.title,
      lectureName: mockLectureName(req.projectId),
      dueDate: req.dueDate,
      dueTime: req.dueTime,
      lectureId: req.lectureId,
      memo: req.memo,
    };
    updateMockTodo(todo);
    return todo;
  }
  return apiClient.patch<Todo>(`/todos/${req.todoId}`, req);
}

// TODO 삭제
export async function deleteTodo(todoId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    removeMockTodo(todoId);
    return;
  }
  await apiClient.delete<void>(`/todos/${todoId}`);
}
