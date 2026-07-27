// src/features/todo/lib/todoName.ts
import type { Todo } from '@/shared/types/api';

// 할 일 표시 이름 = "강의명 제목" (예: '운영체제론 2주차 복습하기').
// 강의명(lectureName)과 제목(title)을 따로 갖고 화면에서 합쳐 보여준다. (시험 일정 examName과 동일 규칙)
// 강의명이 없으면(null) 제목만 쓴다.
export function todoName(todo: Pick<Todo, 'lectureName' | 'title'>): string {
  return todo.lectureName ? `${todo.lectureName} ${todo.title}` : todo.title;
}
