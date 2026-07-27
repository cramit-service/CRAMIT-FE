// src/mocks/todo.ts — TODO mock
import type { Todo } from '@/shared/types/api';
import { dateFromToday } from '@/shared/lib/date';

// TODO mock — 홈 캘린더가 "오늘이 속한 달"을 기본으로 보여주므로,
// 고정 날짜 대신 상대 날짜(dateFromToday)로 두어 언제 열어도 이번 달 칸에 뜨게 한다. (mockExams와 동일 이유)
export const mockTodos: Todo[] = [
  {
    todoId: '1',
    projectId: '1',
    title: 'OSI 7계층 개념 학습',
    dueDate: dateFromToday(1),
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  {
    todoId: '2',
    projectId: '1',
    title: 'TCP/IP 정리',
    dueDate: dateFromToday(4),
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: true,
  },
];
