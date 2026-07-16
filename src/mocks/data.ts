// src/mocks/data.ts
import type { Project, Exam, Todo, User } from '@/shared/types/api';

export const mockUser: User = {
  userId: '1',
  email: 'test@cramit.com',
  nickname: '김진우',
  provider: 'EMAIL',
  profileImage: null,
};

export const mockProjects: Project[] = [
  { projectId: '1', title: '운영체제', createdAt: '2026-03-02T09:00:00Z' },
  { projectId: '2', title: '자료구조', createdAt: '2026-03-05T09:00:00Z' },
  {
    projectId: '3',
    title: '컴퓨터네트워크',
    createdAt: '2026-03-10T09:00:00Z',
  },
];

export const mockExams: Exam[] = [
  {
    examId: '1',
    projectId: '1',
    title: '중간고사',
    lectureName: '운영체제',
    examDate: '2026-04-20',
    memo: '3~7장 범위',
    createdAt: '2026-03-15T09:00:00Z',
  },
];

export const mockTodos: Todo[] = [
  {
    todoId: '1',
    projectId: '1',
    title: 'OSI 7계층 개념 학습',
    dueDate: '2026-04-15',
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: false,
  },
  {
    todoId: '2',
    projectId: '1',
    title: 'TCP/IP 정리',
    dueDate: '2026-04-16',
    dueTime: null,
    lectureId: null,
    memo: null,
    isCompleted: true,
  },
];
