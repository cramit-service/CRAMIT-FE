// src/features/project/api.ts
import type {
  Chapter,
  CreateChapterRequest,
  CreateProjectRequest,
  UpdateChapterRequest,
  Project,
  ProjectSummary,
  UpdateProjectRequest,
} from '@/shared/types/api';
import {
  ApiRequestError,
  UPLOAD_ABORTED,
  apiClient,
  type UploadOptions,
} from '@/shared/lib/apiClient';
import {
  addMockProjectSummary,
  findMockProjectSummary,
  mockProjects,
  updateMockProjectSummary,
} from '@/mocks/project';
import {
  addMockChapter,
  findMockChapter,
  nextMockChapterNumber,
  updateMockChapter,
} from '@/mocks/study';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = true;

// 가짜 지연을 흉내내는 헬퍼 (실제 네트워크처럼 잠깐 기다림).
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// mock 업로드의 진행률·취소를 실제 XHR 경로와 같은 모양으로 흉내낸다.
// 이게 없으면 USE_MOCK 상태에서 대기 화면이 늘 0%로 멈춰 있어 화면을 확인할 수 없다.
async function mockUpload(
  { onProgress, signal }: UploadOptions,
  totalMs: number,
): Promise<void> {
  const steps = 20;
  for (let i = 1; i <= steps; i += 1) {
    await delay(totalMs / steps);
    // 취소는 다음 조각을 보내기 전에 확인한다 — 실제 XHR의 abort와 같은 시점이다.
    if (signal?.aborted) {
      throw new ApiRequestError(UPLOAD_ABORTED, '업로드를 취소했어요.', 0);
    }
    onProgress?.(i / steps);
  }
}

// 프로젝트 목록 조회
export async function getProjects(): Promise<Project[]> {
  if (USE_MOCK) {
    await delay(300); // 로딩 상태 확인용
    // 강의 생성이 이 배열을 직접 고치므로 복사본을 준다 (getProjectSummaries와 같은 이유)
    return [...mockProjects];
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

// 내 강의 생성 (Figma 1:2614) — 학습하기 목록에 카드 한 장이 늘어난다.
// 목록이 쓰는 건 Project가 아니라 ProjectSummary(태그용 메타 포함)라 그 형태로 돌려준다.
// TODO: 백엔드 엔드포인트·응답 형태 확정 시 재확인 필요
export async function createLecture(
  req: CreateProjectRequest,
): Promise<ProjectSummary> {
  if (USE_MOCK) {
    await delay(300);
    const summary: ProjectSummary = {
      projectId: String(Date.now()),
      title: req.title,
      createdAt: new Date().toISOString(),
      // 시안에 교수명은 선택이라 비어 있을 수 있다. 태그는 "OOO 교수님"이라 빈 값이면 어색해서
      // 목록 카드가 이미 쓰는 표기에 맞춰 "미정"으로 채운다.
      professor: req.professor ?? '미정',
      // 방금 만든 강의라 아직 주차가 없다.
      chapterCount: 0,
      // 모달은 시험 날짜만 받고 시험명은 받지 않는다. D-DAY 태그는 이름과 날짜가 둘 다
      // 있어야 뜨므로(getDday), 날짜를 넣었으면 중립적인 이름을 붙여 태그가 보이게 한다.
      examName: req.examDate ? '시험' : null,
      examDate: req.examDate,
      sharedBy: null,
    };
    addMockProjectSummary(summary);
    return summary;
  }
  return apiClient.post<ProjectSummary>('/projects', req);
}

// 강의 수정 — 강의 상세 헤더의 "수정하기"(연필). 생성 모달의 수정 모드가 이걸 부른다.
export async function updateLecture(
  req: UpdateProjectRequest,
): Promise<ProjectSummary> {
  if (USE_MOCK) {
    await delay(300);
    const current = findMockProjectSummary(req.projectId);
    if (!current) throw new Error('수정할 강의를 찾지 못했어요.');
    // 챕터 수·공유자처럼 모달이 건드리지 않는 값은 그대로 둔다.
    const summary: ProjectSummary = {
      ...current,
      title: req.title,
      professor: req.professor ?? '미정',
      examName: req.examDate ? (current.examName ?? '시험') : null,
      examDate: req.examDate,
    };
    updateMockProjectSummary(summary);
    return summary;
  }
  return apiClient.patch<ProjectSummary>(`/projects/${req.projectId}`, req);
}

// 새 주차(챕터) 업로드.
// PDF·녹음 파일이 함께 가므로 JSON이 아니라 multipart/form-data로 보낸다.
// TODO: 백엔드 엔드포인트·필드명 확정 시 경로와 form key 재확인 필요.
export async function createChapter(
  req: CreateChapterRequest,
  options: UploadOptions = {},
): Promise<Chapter> {
  if (USE_MOCK) {
    // 파일 크기와 무관하게 늘 같은 시간이 걸리면 업로드 느낌이 안 나서 조금 길게 둔다.
    await mockUpload(options, 2400);
    const chapter: Chapter = {
      chapterId: `c${Date.now()}`,
      projectId: req.projectId,
      chapterNumber: nextMockChapterNumber(),
      title: req.title,
      // STT·요약이 끝나기 전이라 아직 아무도 학습하지 않은 상태다.
      createdAt: new Date().toISOString(),
      status: 'BEFORE',
      lectureDate: req.lectureDate,
      professor: req.professor,
      materialFileName: req.materialFile?.name ?? null,
      audioFileName: req.audioFile?.name ?? null,
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

  return apiClient.upload<Chapter>(
    `/projects/${req.projectId}/chapters`,
    form,
    options,
  );
}

// 주차(챕터) 수정 — 주차 카드를 꾹 눌러 여는 "주차 정보 수정하기" 모달.
// 생성과 같은 multipart 폼이지만 파일은 새로 고른 것만 싣는다(안 고르면 기존 파일 유지).
// TODO: 백엔드 엔드포인트·필드명 확정 시 경로와 form key 재확인 필요.
export async function updateChapter(
  req: UpdateChapterRequest,
  options: UploadOptions = {},
): Promise<Chapter> {
  if (USE_MOCK) {
    await mockUpload(options, 1600);
    const current = findMockChapter(req.chapterId);
    if (!current) throw new Error('수정할 주차를 찾지 못했어요.');
    // 주차 번호·생성 시각·학습 상태처럼 모달이 건드리지 않는 값은 그대로 둔다.
    const chapter: Chapter = {
      ...current,
      projectId: req.projectId,
      title: req.title,
      lectureDate: req.lectureDate,
      professor: req.professor,
      materialFileName: req.materialFile?.name ?? current.materialFileName,
      audioFileName: req.audioFile?.name ?? current.audioFileName,
    };
    updateMockChapter(chapter);
    return chapter;
  }

  const form = new FormData();
  form.append('title', req.title);
  form.append('lectureDate', req.lectureDate);
  if (req.professor) form.append('professor', req.professor);
  if (req.materialFile) form.append('materialFile', req.materialFile);
  if (req.audioFile) form.append('audioFile', req.audioFile);

  return apiClient.uploadPatch<Chapter>(
    `/chapters/${req.chapterId}`,
    form,
    options,
  );
}
