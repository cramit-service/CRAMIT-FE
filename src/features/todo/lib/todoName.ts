// src/features/todo/lib/todoName.ts
import type { Todo } from '@/shared/types/api';

// 표시 이름 = "강의명 제목" (예: '운영체제론 2주차 복습하기').
// 백엔드가 강의명과 제목을 따로 주므로 화면에서 합친다. (시험 일정 examName과 동일 규칙)
export function todoName(todo: Pick<Todo, 'lectureName' | 'title'>): string {
  return todo.lectureName ? `${todo.lectureName} ${todo.title}` : todo.title;
}
