// src/mocks/exam.ts — 시험 일정 mock
import type { Exam } from '@/shared/types/api';
import { dateFromToday } from '@/shared/lib/date';

// 다가오는 시험 일정 mock — D-DAY / D-1~3 / D-4+ 색이 언제 켜도 한 번에 보이도록,
// 고정 날짜가 아니라 "오늘 기준" 상대 날짜로 생성한다. (시간이 지나도 mock을 안 고쳐도 됨)
// 과거 1건(어제)은 getExams의 "다가오는" 필터에서 빠지는지 확인하려고 남겨둔다.
export const mockExams: Exam[] = [
  {
    examId: '1',
    projectId: '1',
    title: '중간고사',
    lectureName: '운영체제론',
    examDate: dateFromToday(0), // 오늘 → D-DAY (빨강)
    memo: '3~7장 범위',
    createdAt: '2026-07-01T09:00:00Z',
    progress: 85,
  },
  {
    examId: '2',
    projectId: '3',
    title: '퀴즈 2회',
    lectureName: '컴퓨터네트워크',
    examDate: dateFromToday(1), // 내일 → D-1 (노랑)
    memo: null,
    createdAt: '2026-07-02T09:00:00Z',
    progress: 40,
  },
  {
    examId: '3',
    projectId: '2',
    title: '중간고사',
    lectureName: '자료구조',
    examDate: dateFromToday(3), // D-3 (노랑)
    memo: '실습 과제 범위 포함',
    createdAt: '2026-07-03T09:00:00Z',
    progress: 60,
  },
  {
    examId: '4',
    projectId: '1',
    title: '기말 대비 모의고사',
    lectureName: '운영체제론',
    examDate: dateFromToday(8), // D-8 (파랑)
    memo: null,
    createdAt: '2026-07-04T09:00:00Z',
    progress: 20,
  },
  {
    examId: '5',
    projectId: '1',
    title: '쪽지시험',
    lectureName: '운영체제론',
    examDate: dateFromToday(-1), // 어제 → "다가오는" 필터에서 제외되어야 함(경계 확인)
    memo: null,
    createdAt: '2026-04-01T09:00:00Z',
    progress: 100,
  },
];
