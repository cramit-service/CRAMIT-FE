// src/features/project/api.ts
import type { Exam, Project } from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import { toLocalDateString } from '@/shared/lib/date';
import { mockExams, mockProjects } from '@/mocks/data';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = true;

// 가짜 지연을 흉내내는 헬퍼 (실제 네트워크처럼 잠깐 기다림).
// 쿼리가 취소되면 실제 fetch처럼 즉시 중단되도록 AbortSignal을 받는다. (study/api.ts와 동일 패턴)
const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    // 이미 취소된 채로 들어오면 기다릴 것도 없이 즉시 중단
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    // 기다리는 동안 취소되면 타이머를 지우고 중단
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

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

// 다가오는 시험 일정 조회 — 홈 대시보드용.
// 특정 프로젝트가 아니라 내 전체 시험을 돌려준다. (다가오는 것만 추리고 정렬하는 건 화면 몫)
export async function getExams(signal?: AbortSignal): Promise<Exam[]> {
  if (USE_MOCK) {
    await delay(300, signal);
    // 백엔드 계약을 흉내낸다: 다가오는 시험만(오늘 포함) 골라 시험일 오름차순으로 준다.
    // 실제 서버가 할 일을 mock이 대신하는 것이라, USE_MOCK을 꺼도 화면 로직은 그대로다.
    const today = toLocalDateString(new Date());
    return mockExams
      .filter((exam) => exam.examDate >= today)
      .sort((a, b) => a.examDate.localeCompare(b.examDate));
  }
  return apiClient.get<Exam[]>('/exams', { signal });
}
