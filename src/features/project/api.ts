// src/features/project/api.ts
import type { Project } from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import { mockProjects } from '@/mocks/data';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = true;

// 가짜 지연을 흉내내는 헬퍼 (실제 네트워크처럼 잠깐 기다림)
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 프로젝트 목록 조회
export async function getProjects(): Promise<Project[]> {
  if (USE_MOCK) {
    await delay(300); // 로딩 상태 확인용
    return mockProjects;
  }
  return apiClient.get<Project[]>('/projects');
}

// 프로젝트 생성
export async function createProject(title: string): Promise<Project> {
  if (USE_MOCK) {
    await delay(300);
    return {
      projectId: String(Date.now()),
      title,
      createdAt: new Date().toISOString(),
    };
  }
  return apiClient.post<Project>('/projects', { title });
}
