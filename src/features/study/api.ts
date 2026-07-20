// src/features/study/api.ts
import type { Chapter, ProjectDetail } from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import { mockChapters, mockProjectDetail } from '@/mocks/data';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로) — project/api.ts와 동일 패턴
const USE_MOCK = true;

// 가짜 지연을 흉내내는 헬퍼 (실제 네트워크처럼 잠깐 기다림).
// 쿼리가 취소되면 실제 fetch처럼 즉시 중단되도록 AbortSignal을 받는다.
const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

// 프로젝트 상세(헤더 메타) 조회
export async function getProjectDetail(
  projectId: string,
  signal?: AbortSignal,
): Promise<ProjectDetail> {
  if (USE_MOCK) {
    await delay(300, signal); // 로딩 상태 확인용
    return { ...mockProjectDetail, projectId };
  }
  return apiClient.get<ProjectDetail>(`/projects/${projectId}`, { signal });
}

// 챕터(단계별 학습) 목록 조회
export async function getChapters(
  projectId: string,
  signal?: AbortSignal,
): Promise<Chapter[]> {
  if (USE_MOCK) {
    await delay(300, signal);
    return mockChapters.map((c) => ({ ...c, projectId }));
  }
  return apiClient.get<Chapter[]>(`/projects/${projectId}/chapters`, {
    signal,
  });
}
