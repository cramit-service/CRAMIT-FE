// src/features/project/api.ts
import type {
  Chapter,
  CreateChapterRequest,
  Project,
} from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import { mockProjects } from '@/mocks/project';
import { addMockChapter, nextMockChapterNumber } from '@/mocks/study';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = true;

// 가짜 지연을 흉내내는 헬퍼 (실제 네트워크처럼 잠깐 기다림).
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

// 새 주차(챕터) 업로드.
// PDF·녹음 파일이 함께 가므로 JSON이 아니라 multipart/form-data로 보낸다.
// TODO: 백엔드 엔드포인트·필드명 확정 시 경로와 form key 재확인 필요.
export async function createChapter(
  req: CreateChapterRequest,
): Promise<Chapter> {
  if (USE_MOCK) {
    // 파일 크기와 무관하게 늘 같은 시간이 걸리면 업로드 느낌이 안 나서 조금 길게 둔다.
    await delay(800);
    const chapter: Chapter = {
      chapterId: `c${Date.now()}`,
      projectId: req.projectId,
      chapterNumber: nextMockChapterNumber(),
      title: req.title,
      // STT·요약이 끝나기 전이라 아직 아무도 학습하지 않은 상태다.
      createdAt: new Date().toISOString(),
      status: 'BEFORE',
    };
    addMockChapter(chapter);
    return chapter;
  }

  const form = new FormData();
  form.append('title', req.title);
  form.append('lectureDate', req.lectureDate);
  if (req.professor) form.append('professor', req.professor);
  if (req.materialFile) form.append('materialFile', req.materialFile);
  if (req.audioFile) form.append('audioFile', req.audioFile);

  return apiClient.post<Chapter>(`/projects/${req.projectId}/chapters`, form);
}
