// src/mocks/todo.ts — TODO mock
import type { TodoResponse } from '@/shared/types/api';
import { dateFromToday } from '@/shared/lib/date';

// 서버의 LocalDateTime. 시간을 안 고른 할 일은 자정으로 둔다(features/todo/api.ts의 NO_TIME).
const at = (days: number, time = '00:00') =>
  `${dateFromToday(days)}T${time}:00`;

// TODO mock — 홈 캘린더가 "오늘이 속한 달"을 기본으로 보여주므로,
// 고정 날짜 대신 상대 날짜(dateFromToday)로 두어 언제 열어도 이번 달 칸에 뜨게 한다. (mockExams와 동일 이유)
// 완료/미완료, 메모 유무, 마감시간 유무를 섞어 체크리스트 위젯의 모든 상태가 한 번에 보이게 한다.
// 서버 응답 모양(TodoResponse) 그대로 둔다 — 화면 타입으로 들고 있으면 features/todo/api.ts의
// 변환이 mock을 켠 동안 한 번도 실행되지 않는다.
export const mockTodos: TodoResponse[] = [
  {
    todoId: 1,
    weekId: null,
    content: '2주차 복습하기',
    memo: 'LMS에 올라온 동영상 문제 풀이 참고하기',
    dueDate: at(1, '13:30'),
    todoType: 'USER',
    isCompleted: true,
    sortOrder: 0,
  },
  {
    todoId: 2,
    weekId: null,
    content: 'TCP/IP 계층 정리',
    memo: null,
    dueDate: at(2),
    todoType: 'USER',
    isCompleted: false,
    sortOrder: 1,
  },
  {
    todoId: 3,
    weekId: null,
    content: '과제 제출',
    memo: '실습 코드 GitHub에 push 후 링크 제출',
    dueDate: at(3, '18:00'),
    todoType: 'USER',
    isCompleted: false,
    sortOrder: 2,
  },
  {
    todoId: 4,
    weekId: null,
    content: '중간고사 오답노트 작성',
    memo: null,
    dueDate: at(5, '09:00'),
    todoType: 'USER',
    isCompleted: true,
    sortOrder: 3,
  },
  {
    todoId: 5,
    weekId: null,
    content: '실습 예습',
    memo: null,
    dueDate: at(6),
    todoType: 'USER',
    isCompleted: false,
    sortOrder: 4,
  },
  {
    todoId: 6,
    weekId: null,
    content: '3주차 예습',
    memo: null,
    dueDate: at(7),
    todoType: 'USER',
    isCompleted: false,
    sortOrder: 5,
  },
  {
    todoId: 7,
    weekId: null,
    content: '이진트리 정리',
    memo: null,
    dueDate: at(8, '15:00'),
    todoType: 'USER',
    isCompleted: false,
    sortOrder: 6,
  },
  {
    todoId: 8,
    weekId: null,
    content: '라우팅 알고리즘 복습',
    memo: '교재 5장 참고',
    dueDate: at(9),
    todoType: 'USER',
    isCompleted: true,
    sortOrder: 7,
  },
  {
    todoId: 9,
    weekId: null,
    content: '프로세스 스케줄링 정리',
    memo: null,
    dueDate: at(4),
    todoType: 'USER',
    isCompleted: false,
    sortOrder: 8,
  },
  {
    todoId: 10,
    weekId: null,
    content: '해시테이블 실습',
    memo: null,
    dueDate: at(10, '13:00'),
    todoType: 'USER',
    isCompleted: false,
    sortOrder: 9,
  },
  // 아래 셋은 캘린더 한 칸에 일정이 넘칠 때(+N)를 보기 위한 것이다.
  // mockExams에 D-3·D-8 시험이 있어 이 날짜가 각각 3개(+1)·4개(+2) 칸이 된다.
  // 날짜를 옮기면 두 상태 중 하나가 화면에서 사라진다.
  {
    todoId: 11,
    weekId: null,
    content: '실습 코드 리팩터링',
    memo: null,
    dueDate: at(3),
    todoType: 'USER',
    isCompleted: false,
    sortOrder: 10,
  },
  {
    todoId: 12,
    weekId: null,
    content: '정규화 연습문제',
    memo: null,
    dueDate: at(8),
    todoType: 'USER',
    isCompleted: false,
    sortOrder: 11,
  },
  {
    todoId: 13,
    weekId: null,
    content: '고유값 계산 연습',
    memo: null,
    dueDate: at(8, '11:00'),
    todoType: 'USER',
    isCompleted: false,
    sortOrder: 12,
  },
  // 마감이 지난 항목 — 보기 드롭다운의 "지난 할 일"을 확인하려면 과거 날짜가 있어야 한다.
  // 완료/미완료를 섞어 두어 지나고도 안 한 것이 눈에 띄는지 볼 수 있게 한다.
  {
    todoId: 14,
    weekId: null,
    content: '1주차 퀴즈 응시',
    memo: null,
    dueDate: at(-1, '23:59'),
    todoType: 'USER',
    isCompleted: true,
    sortOrder: 13,
  },
  {
    todoId: 15,
    weekId: null,
    content: '서브넷 마스크 계산 연습',
    memo: '연습문제 3장까지',
    dueDate: at(-4),
    todoType: 'USER',
    isCompleted: false,
    sortOrder: 14,
  },
  {
    todoId: 16,
    weekId: null,
    content: '오리엔테이션 자료 읽기',
    memo: null,
    dueDate: at(-9, '10:00'),
    todoType: 'USER',
    isCompleted: true,
    sortOrder: 15,
  },
];

// mock 전용 쓰기 헬퍼. 새로고침하면 사라진다(모듈 메모리라 세션 단위). mockExams와 같은 방식이다.

export function addMockTodo(todo: TodoResponse): void {
  mockTodos.push(todo);
}

export function updateMockTodo(todo: TodoResponse): void {
  const index = mockTodos.findIndex((t) => t.todoId === todo.todoId);
  if (index === -1) throw new Error('수정할 할 일을 찾지 못했어요.');
  mockTodos[index] = todo;
}

export function removeMockTodo(todoId: number): void {
  const index = mockTodos.findIndex((t) => t.todoId === todoId);
  if (index === -1) throw new Error('삭제할 할 일을 찾지 못했어요.');
  mockTodos.splice(index, 1);
}
