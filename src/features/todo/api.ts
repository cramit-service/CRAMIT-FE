// src/features/todo/api.ts
import type {
  CreateTodoRequest,
  Todo,
  TodoBody,
  TodoResponse,
  UpdateTodoRequest,
} from '@/shared/types/api';
import { ApiRequestError, apiClient } from '@/shared/lib/apiClient';
import {
  addMockTodo,
  mockTodos,
  removeMockTodo,
  updateMockTodo,
} from '@/mocks/todo';

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

// 서버의 dueDate(LocalDateTime)는 날짜와 시간을 한 필드에 담고, 화면은 둘을 따로 다룬다.
// 쪼개고 합치는 일은 아래 toTodo·toTodoBody 두 곳에서만 한다.
// 초와 소수 초는 화면이 쓰지 않으므로 있어도 없어도 받는다.
const DUE_DATE = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?$/;
// 마감 시간을 고르지 않은 할 일. 서버 필드 하나로는 "시간 없음"을 따로 표현할 수 없다.
const NO_TIME = '00:00';

const invalid = () =>
  new ApiRequestError('INVALID_RESPONSE', '할 일 정보를 해석할 수 없어요.', 0);

// 응답 → 화면. 화면이 쓰는 필드가 계약과 다르면 여기서 끊는다 — 그대로 넘기면
// 엉뚱한 칸이 아니라 캘린더·체크리스트 전체가 깨진다.
function toTodo(r: TodoResponse): Todo {
  const due = typeof r?.dueDate === 'string' ? DUE_DATE.exec(r.dueDate) : null;
  if (
    !due ||
    typeof r.todoId !== 'number' ||
    (r.weekId !== null && typeof r.weekId !== 'number') ||
    typeof r.content !== 'string' ||
    (r.memo !== null && typeof r.memo !== 'string') ||
    typeof r.isCompleted !== 'boolean'
  ) {
    throw invalid();
  }
  return {
    todoId: r.todoId,
    // 서버는 주차(weekId)만 준다. 강의와 강의명은 응답에 없어 비워 둔다.
    projectId: null,
    lectureName: null,
    title: r.content,
    dueDate: due[1],
    dueTime: due[2] === NO_TIME ? null : due[2],
    chapterId: r.weekId,
    memo: r.memo,
    isCompleted: r.isCompleted,
  };
}

// 화면 → 요청.
function toTodoBody(req: CreateTodoRequest): TodoBody {
  return {
    weekId: req.chapterId,
    content: req.title,
    dueDate: `${req.dueDate}T${req.dueTime ?? NO_TIME}:00`,
    memo: req.memo,
  };
}

function toTodos(list: TodoResponse[]): Todo[] {
  if (!Array.isArray(list)) throw invalid();
  return list.map(toTodo);
}

// 내 전체 TODO 조회 — 홈 캘린더용.
// 캘린더는 dueDate 기준으로 달력 칸에 뿌리므로 여기선 거르지 않고 전부 준다.
export async function getTodos(signal?: AbortSignal): Promise<Todo[]> {
  if (USE_MOCK) {
    await delay(300, signal);
    // mock도 서버 모양이라 변환을 그대로 탄다. 변환이 매번 새 객체를 만들어서
    // 다시 조회하면 참조가 바뀌고, TanStack Query가 갱신으로 알아본다.
    return toTodos(mockTodos);
  }
  return toTodos(await apiClient.get<TodoResponse[]>('/todos', { signal }));
}

// TODO 추가 (Figma 1:1946)
// 서버는 만든 할 일 전체가 아니라 id만 돌려준다. 화면은 목록을 다시 불러 그린다.
export async function createTodo(req: CreateTodoRequest): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    addMockTodo({
      todoId: Date.now(),
      ...toTodoBody(req),
      todoType: 'USER',
      isCompleted: false,
      sortOrder: mockTodos.length,
    });
    return;
  }
  await apiClient.post<unknown>('/todos', toTodoBody(req));
}

// TODO 수정 (Figma 1:2137)
export async function updateTodo(req: UpdateTodoRequest): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    const current = mockTodos.find((t) => t.todoId === req.todoId);
    if (!current) throw new Error('수정할 할 일을 찾지 못했어요.');
    // 완료 여부는 모달이 건드리지 않는다(체크박스가 따로 다룬다).
    updateMockTodo({ ...current, ...toTodoBody(req) });
    return;
  }
  await apiClient.patch<unknown>(`/todos/${req.todoId}`, toTodoBody(req));
}

// TODO 삭제
export async function deleteTodo(todoId: number): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    removeMockTodo(todoId);
    return;
  }
  await apiClient.delete<void>(`/todos/${todoId}`);
}
