// src/mocks/project.ts — 프로젝트 목록 mock
import type { Project } from '@/shared/types/api';

export const mockProjects: Project[] = [
  { projectId: '1', title: '운영체제', createdAt: '2026-03-02T09:00:00Z' },
  { projectId: '2', title: '자료구조', createdAt: '2026-03-05T09:00:00Z' },
  {
    projectId: '3',
    title: '컴퓨터네트워크',
    createdAt: '2026-03-10T09:00:00Z',
  },
];
