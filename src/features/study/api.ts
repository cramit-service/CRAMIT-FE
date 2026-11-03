// src/features/study/api.ts
import type {
  Chapter,
  Exam,
  LectureDetailResponse,
  LectureMaterial,
  LectureScript,
  LectureSummary,
  MyLectureResponse,
  ProcessStatus,
  ProjectDetail,
  ProjectSummary,
} from '@/shared/types/api';
import { ApiRequestError, apiClient } from '@/shared/lib/apiClient';
import { getExams } from '@/features/exam/api';
import { getMaterialFileUrl } from '@/mocks/materialStore';
import {
  mockChapters,
  mockLectureMaterial,
  mockLectureScript,
  mockLectureSummary,
} from '@/mocks/study';
import { findMockLecture, mockLectures } from '@/mocks/project';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로) — project/api.ts와 동일 패턴
const USE_MOCK = true;
// 강의 목록·상세만 먼저 백엔드에 붙었다. 위 스위치는 아직 mock인 나머지 함수들이 쓴다.
const USE_MOCK_LECTURE = false;

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

const invalidLecture = () =>
  new ApiRequestError('INVALID_RESPONSE', '강의 정보를 해석할 수 없어요.', 0);

// 응답 → 화면. 시험은 강의 응답에 없어서, 다가오는 시험(시험일 오름차순) 중 그 강의의 첫 번째를 붙인다.
function toProjectSummary(r: MyLectureResponse, exams: Exam[]): ProjectSummary {
  if (
    typeof r?.lectureId !== 'number' ||
    typeof r.title !== 'string' ||
    (r.professorName !== null && typeof r.professorName !== 'string') ||
    typeof r.weekCount !== 'number' ||
    typeof r.colorIndex !== 'number'
  ) {
    throw invalidLecture();
  }
  const exam = exams.find((e) => e.projectId === r.lectureId);
  return {
    projectId: r.lectureId,
    title: r.title,
    // 교수명을 비우고 수정하면 서버에 빈 문자열로 남는다. 화면은 '없음'을 null로 다룬다.
    professor: r.professorName || null,
    chapterCount: r.weekCount,
    examName: exam?.title ?? null,
    examDate: exam?.examDate ?? null,
    colorIndex: r.colorIndex,
  };
}

// 시험은 D-DAY 표시에만 쓰인다. 시험 조회가 실패해도 강의 목록·헤더는 그린다.
// 취소는 실패가 아니라서 그대로 던져 TanStack Query가 취소로 알아보게 한다.
function getExamsOrEmpty(signal?: AbortSignal): Promise<Exam[]> {
  return getExams(signal).catch((error: unknown) => {
    if (
      signal?.aborted ||
      (error instanceof DOMException && error.name === 'AbortError')
    ) {
      throw error;
    }
    return [];
  });
}

// 학습하기(강의 목록) 조회.
export async function getProjectSummaries(
  signal?: AbortSignal,
): Promise<ProjectSummary[]> {
  const [lectures, exams] = await Promise.all([
    USE_MOCK_LECTURE
      ? delay(300, signal).then(() => mockLectures)
      : apiClient.get<MyLectureResponse[]>('/lectures/my', { signal }),
    getExamsOrEmpty(signal),
  ]);
  if (!Array.isArray(lectures)) throw invalidLecture();
  // 서버 목록에 정렬이 없어 강의를 수정하면 순서가 바뀔 수 있다.
  return lectures
    .map((l) => toProjectSummary(l, exams))
    .sort((a, b) => a.projectId - b.projectId);
}

export async function getProjectDetail(
  projectId: number,
  signal?: AbortSignal,
): Promise<ProjectDetail> {
  const [lecture, exams] = await Promise.all([
    USE_MOCK_LECTURE
      ? delay(300, signal).then(() => {
          const found = findMockLecture(projectId);
          if (!found) {
            throw new ApiRequestError(
              'ENTITY_NOT_FOUND',
              '강의를 찾을 수 없어요.',
              404,
            );
          }
          return found;
        })
      : apiClient.get<LectureDetailResponse>(`/lectures/${projectId}`, {
          signal,
        }),
    getExamsOrEmpty(signal),
  ]);
  // 주차는 아직 mock이라 "강의 N개"는 화면에 그려지는 mock 주차 목록에서 센다.
  return toProjectSummary(
    { ...lecture, weekCount: mockChapters.length },
    exams,
  );
}

export async function getChapters(
  projectId: number,
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
  projectId: number,
  chapterId: number,
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
        '챕터를 찾을 수 없어요.',
        404,
      );
    }
    return { ...found, projectId, chapterId };
  }
  return apiClient.get<Chapter>(`/chapters/${chapterId}`, { signal });
}

// 챕터의 강의자료(PDF 위치·페이지 수·녹음 길이) 조회
// TODO: audioUrl은 백엔드 확정 후 응답에 추가한다
export async function getLectureMaterial(
  chapterId: number,
  signal?: AbortSignal,
): Promise<LectureMaterial> {
  if (USE_MOCK) {
    await delay(300, signal);
    // 이 챕터에 직접 올린 파일이 있으면 그걸 그린다.
    const uploaded = await getMaterialFileUrl(chapterId);
    // 샘플은 mockLectureMaterial이 가리키는 4번 챕터 하나에만 붙인다. 모든 챕터에 깔면
    // 어디에 올려도 이미 자료가 있는 것처럼 보여 직접 올린 게 붙었는지 확인할 수가 없다.
    const sample =
      chapterId === mockLectureMaterial.chapterId
        ? mockLectureMaterial.pdfUrl
        : null;
    const pdfUrl = uploaded ?? sample;
    return {
      ...mockLectureMaterial,
      chapterId,
      pdfUrl,
      // 자료가 없으면 페이지 수도 0이어야 목록이 유령 페이지로 차지 않는다
      pdfPageCount: pdfUrl ? mockLectureMaterial.pdfPageCount : 0,
    };
  }
  return apiClient.get<LectureMaterial>(`/chapters/${chapterId}/material`, {
    signal,
  });
}

// 챕터의 AI 강의 요약(Markdown 원문) 조회
// TODO: 백엔드 엔드포인트 확정 시 경로 재확인 필요
export async function getLectureSummary(
  chapterId: number,
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
  chapterId: number,
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
  chapterId: number,
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
  chapterId: number,
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
  chapterId: number,
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

// 회독 수를 세팅한다. 올리고 내리는 두 엔드포인트가 아니라 값을 하나 넣는 쪽이다 —
// 증가 전용으로 두면 한 번 잘못 누른 것을 되돌릴 수 없고, DESIGN.md §4가 그걸
// "기록이 아니라 오기"라고 부른다.
// TODO(백엔드): 경로 확정 필요. PATCH /chapters/{id} 의 부분 수정으로 갈 수도 있다.
export async function setChapterReviewCount(
  chapterId: number,
  reviewCount: number,
  signal?: AbortSignal,
): Promise<Chapter> {
  if (USE_MOCK) {
    await delay(200, signal);
    const found = mockChapters.find((c) => c.chapterId === chapterId);
    if (!found) {
      throw new ApiRequestError(
        'CHAPTER_NOT_FOUND',
        '챕터를 찾을 수 없어요.',
        404,
      );
    }
    // 목에서도 실제로 값을 바꿔 둔다. 안 그러면 무효화 뒤 옛 값이 돌아와 화면이 튄다.
    found.reviewCount = reviewCount;
    return { ...found };
  }
  return apiClient.patch<Chapter>(
    `/chapters/${chapterId}/review-count`,
    { reviewCount },
    { signal },
  );
}
