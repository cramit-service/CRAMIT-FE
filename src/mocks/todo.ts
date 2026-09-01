// src/mocks/todo.ts — TODO mock
import type { Todo } from '@/shared/types/api';
import { dateFromToday } from '@/shared/lib/date';

// TODO mock — 홈 캘린더가 "오늘이 속한 달"을 기본으로 보여주므로,
// 고정 날짜 대신 상대 날짜(dateFromToday)로 두어 언제 열어도 이번 달 칸에 뜨게 한다. (mockExams와 동일 이유)
// 완료/미완료, 메모 유무, 마감시간 유무를 섞어 체크리스트 위젯의 모든 상태가 한 번에 보이게 한다.
// title은 과목명을 뺀 순수 할 일이고, 강의명은 lectureName으로 분리한다(표시 시 합침 — 시험 일정과 동일).
// projectId와 lectureName은 mockProjectSummaries와 반드시 맞춰 둔다 — 서버는 projectId로
// 강의명을 채워 내려주고 mock도 같은 자리에서 채운다. 어긋나 있으면 TODO를 열어 아무것도
// 바꾸지 않고 저장하는 것만으로 화면의 강의명이 다른 과목으로 바뀐다.
export const mockTodos: Todo[] = [
  {
    todoId: '1',
    projectId: '2',
    title: '2주차 복습하기',
    lectureName: '운영체제',
    dueDate: dateFromToday(1),
    dueTime: '13:30',
    lectureId: null,
    memo: 'LMS에 올라온 동영상 문제 풀이 참고하기',
    isCompleted: true,
  },
  {
    todoId: '2',
    projectId: '4',
    title: 'TCP/IP 계층 정리',
    lectureName: '컴퓨터네트워크',
    dueDate: dateFromToday(2),
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  {
    todoId: '3',
    projectId: '3',
    title: '과제 제출',
    lectureName: '자료구조',
    dueDate: dateFromToday(3),
    dueTime: '18:00',
    lectureId: null,
    memo: '실습 코드 GitHub에 push 후 링크 제출',
    isCompleted: false,
  },
  {
    todoId: '4',
    projectId: '2',
    title: '중간고사 오답노트 작성',
    lectureName: '운영체제',
    dueDate: dateFromToday(5),
    dueTime: '09:00',
    lectureId: null,
    memo: null,
    isCompleted: true,
  },
  {
    todoId: '5',
    projectId: '4',
    title: '실습 예습',
    lectureName: '컴퓨터네트워크',
    dueDate: dateFromToday(6),
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  {
    todoId: '6',
    projectId: '2',
    title: '3주차 예습',
    lectureName: '운영체제',
    dueDate: dateFromToday(7),
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  {
    todoId: '7',
    projectId: '3',
    title: '이진트리 정리',
    lectureName: '자료구조',
    dueDate: dateFromToday(8),
    dueTime: '15:00',
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  {
    todoId: '8',
    projectId: '4',
    title: '라우팅 알고리즘 복습',
    lectureName: '컴퓨터네트워크',
    dueDate: dateFromToday(9),
    dueTime: null,
    lectureId: null,
    memo: '교재 5장 참고',
    isCompleted: true,
  },
  {
    todoId: '9',
    projectId: '2',
    title: '프로세스 스케줄링 정리',
    lectureName: '운영체제',
    dueDate: dateFromToday(4),
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  {
    todoId: '10',
    projectId: '3',
    title: '해시테이블 실습',
    lectureName: '자료구조',
    dueDate: dateFromToday(10),
    dueTime: '13:00',
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  // 아래 셋은 캘린더 한 칸에 일정이 넘칠 때(+N)를 보기 위한 것이다.
  // mockExams에 D-3·D-8 시험이 있어 이 날짜가 각각 3개(+1)·4개(+2) 칸이 된다.
  // 날짜를 옮기면 두 상태 중 하나가 화면에서 사라진다.
  {
    todoId: '11',
    projectId: '3',
    title: '실습 코드 리팩터링',
    lectureName: '자료구조',
    dueDate: dateFromToday(3),
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  {
    todoId: '12',
    projectId: '5',
    title: '정규화 연습문제',
    lectureName: '데이터베이스',
    dueDate: dateFromToday(8),
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  {
    todoId: '13',
    projectId: '6',
    title: '고유값 계산 연습',
    lectureName: '선형대수학',
    dueDate: dateFromToday(8),
    dueTime: '11:00',
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  // 마감이 지난 항목 — 보기 드롭다운의 "지난 할 일"을 확인하려면 과거 날짜가 있어야 한다.
  // 완료/미완료를 섞어 두어 지나고도 안 한 것이 눈에 띄는지 볼 수 있게 한다.
  {
    todoId: '14',
    projectId: '2',
    title: '1주차 퀴즈 응시',
    lectureName: '운영체제',
    dueDate: dateFromToday(-1),
    dueTime: '23:59',
    lectureId: null,
    memo: null,
    isCompleted: true,
  },
  {
    todoId: '15',
    projectId: '4',
    title: '서브넷 마스크 계산 연습',
    lectureName: '컴퓨터네트워크',
    dueDate: dateFromToday(-4),
    dueTime: null,
    lectureId: null,
    memo: '연습문제 3장까지',
    isCompleted: false,
  },
  {
    todoId: '16',
    projectId: '3',
    title: '오리엔테이션 자료 읽기',
    lectureName: '자료구조',
    dueDate: dateFromToday(-9),
    dueTime: '10:00',
    lectureId: null,
    memo: null,
    isCompleted: true,
  },
];

// mock 전용 쓰기 헬퍼. 새로고침하면 사라진다(모듈 메모리라 세션 단위). mockExams와 같은 방식이다.

export function addMockTodo(todo: Todo): void {
  mockTodos.push(todo);
}

export function updateMockTodo(todo: Todo): void {
  const index = mockTodos.findIndex((t) => t.todoId === todo.todoId);
  if (index === -1) throw new Error('수정할 할 일을 찾지 못했어요.');
  mockTodos[index] = todo;
}

export function removeMockTodo(todoId: string): void {
  const index = mockTodos.findIndex((t) => t.todoId === todoId);
  if (index === -1) throw new Error('삭제할 할 일을 찾지 못했어요.');
  mockTodos.splice(index, 1);
}
