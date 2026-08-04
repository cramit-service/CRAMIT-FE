// src/features/study/api.ts
import type {
  Chapter,
  LectureMaterial,
  LectureScript,
  LectureSummary,
  ProcessStatus,
  ProjectDetail,
} from '@/shared/types/api';
import { ApiRequestError, apiClient } from '@/shared/lib/apiClient';
import {
  mockChapters,
  mockLectureMaterial,
  mockLectureScript,
  mockLectureSummary,
  mockProjectDetail,
} from '@/mocks/study';

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
    // "강의 N개" 태그가 목록과 어긋나지 않게 챕터 수는 mock 목록에서 센다.
    // (새 주차를 업로드하면 목록과 함께 이 숫자도 늘어야 한다)
    return {
      ...mockProjectDetail,
      projectId,
      chapterCount: mockChapters.length,
    };
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

// 챕터 단건 조회 (학습 뷰어 헤더용)
// TODO: 백엔드 엔드포인트 확정 시 경로 재확인 필요 (/chapters/{chapterId} 형태 가정)
export async function getChapter(
  projectId: string,
  chapterId: string,
  signal?: AbortSignal,
): Promise<Chapter> {
  if (USE_MOCK) {
    await delay(300, signal);
    const found = mockChapters.find((c) => c.chapterId === chapterId);
    // 없는 id를 첫 챕터로 대체하면 잘못된 URL이 정상 화면처럼 보인다.
    // 실제 404와 같게 던져서 화면이 에러 상태를 타도록 한다.
    if (!found) {
      throw new ApiRequestError(
        'CHAPTER_NOT_FOUND',
        '챕터를 찾을 수 없습니다.',
        404,
      );
    }
    return { ...found, projectId, chapterId };
  }
  return apiClient.get<Chapter>(`/chapters/${chapterId}`, { signal });
}

// 챕터의 강의자료(PDF 페이지 수·녹음 길이) 조회
// TODO: 실제 pdfUrl/audioUrl은 백엔드 확정 후 응답에 추가한다
export async function getLectureMaterial(
  chapterId: string,
  signal?: AbortSignal,
): Promise<LectureMaterial> {
  if (USE_MOCK) {
    await delay(300, signal);
    return { ...mockLectureMaterial, chapterId };
  }
  return apiClient.get<LectureMaterial>(`/chapters/${chapterId}/material`, {
    signal,
  });
}

// 챕터의 AI 강의 요약(Markdown 원문) 조회
// TODO: 백엔드 엔드포인트 확정 시 경로 재확인 필요
export async function getLectureSummary(
  chapterId: string,
  signal?: AbortSignal,
): Promise<LectureSummary> {
  if (USE_MOCK) {
    await delay(300, signal);
    return { ...mockLectureSummary, chapterId };
  }
  return apiClient.get<LectureSummary>(`/chapters/${chapterId}/summary`, {
    signal,
  });
}

// 챕터의 원문 스크립트(STT) 조회
// TODO: 백엔드 엔드포인트 확정 시 경로 재확인 필요
export async function getLectureScript(
  chapterId: string,
  signal?: AbortSignal,
): Promise<LectureScript> {
  if (USE_MOCK) {
    await delay(300, signal);
    return { ...mockLectureScript, chapterId };
  }
  return apiClient.get<LectureScript>(`/chapters/${chapterId}/script`, {
    signal,
  });
}

// STT 변환 상태 조회 (녹음 → 텍스트 변환도 비동기라 READY까지 폴링해야 한다)
// TODO: 백엔드 엔드포인트 확정 시 경로 재확인 필요
export async function getLectureScriptStatus(
  chapterId: string,
  signal?: AbortSignal,
): Promise<ProcessStatus> {
  if (USE_MOCK) {
    await delay(300, signal);
    // mock은 이미 변환이 끝난 챕터를 가정한다. 생성 중 화면을 확인하려면
    // 잠시 'PROCESSING'을 반환하도록 바꿔서 보면 된다. (요약 상태와 같은 방식)
    return 'READY';
  }
  return apiClient.get<ProcessStatus>(`/chapters/${chapterId}/script/status`, {
    signal,
  });
}

// 요약 생성 상태 조회 (AI 요약은 비동기라 READY까지 폴링해야 한다)
// TODO: 백엔드 엔드포인트 확정 시 경로 재확인 필요
export async function getLectureSummaryStatus(
  chapterId: string,
  signal?: AbortSignal,
): Promise<ProcessStatus> {
  if (USE_MOCK) {
    await delay(300, signal);
    // mock은 이미 생성이 끝난 챕터를 가정한다. PROCESSING 화면을 확인하려면
    // 잠시 'PROCESSING'을 반환하도록 바꿔서 보면 된다.
    return 'READY';
  }
  return apiClient.get<ProcessStatus>(`/chapters/${chapterId}/summary/status`, {
    signal,
  });
}

// 요약 Markdown 수정 저장
// TODO: 백엔드 저장 API가 아직 없다. USE_MOCK을 끄기 전까지는 서버에 반영되지 않고
//       화면(쿼리 캐시)에만 남는다. 엔드포인트/메서드 확정 시 경로도 재확인 필요.
export async function updateLectureSummary(
  chapterId: string,
  markdown: string,
  signal?: AbortSignal,
): Promise<LectureSummary> {
  if (USE_MOCK) {
    await delay(300, signal);
    // updatedAt은 "마지막 수정 시각"이라 mock 값을 그대로 돌려주면 안 된다
    return {
      ...mockLectureSummary,
      chapterId,
      markdown,
      updatedAt: new Date().toISOString(),
    };
  }
  return apiClient.patch<LectureSummary>(
    `/chapters/${chapterId}/summary`,
    { markdown },
    { signal },
  );
}
