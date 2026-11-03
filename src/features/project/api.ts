// src/features/project/api.ts
import type {
  Chapter,
  CreateChapterRequest,
  CreateProjectRequest,
  UpdateChapterRequest,
  UpdateProjectRequest,
} from '@/shared/types/api';
import {
  ApiRequestError,
  UPLOAD_ABORTED,
  apiClient,
  type UploadOptions,
} from '@/shared/lib/apiClient';
import { saveMaterialFile } from '@/mocks/materialStore';
import {
  addMockLecture,
  findMockLecture,
  removeMockLecture,
  updateMockLecture,
} from '@/mocks/project';
import {
  addMockChapter,
  findMockChapter,
  nextMockChapterNumber,
  updateMockChapter,
} from '@/mocks/study';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = true;
// 강의 생성·수정·삭제만 먼저 백엔드에 붙었다. 위 스위치는 아직 mock인 주차 함수들이 쓴다.
const USE_MOCK_LECTURE = false;

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

// 서버는 교수명을 professorName으로 받는다.
const toLectureBody = (req: CreateProjectRequest) => ({
  title: req.title,
  professorName: req.professor,
  colorIndex: req.colorIndex,
});

// 내 강의 생성 (Figma 1:2614) — 학습하기 목록에 카드 한 장이 늘어난다.
// 화면은 목록을 다시 불러 그리므로 응답 본문은 쓰지 않는다.
export async function createLecture(req: CreateProjectRequest): Promise<void> {
  if (USE_MOCK_LECTURE) {
    await delay(300);
    addMockLecture({
      lectureId: Date.now(),
      title: req.title,
      professorName: req.professor,
      weekCount: 0,
      colorIndex: req.colorIndex,
    });
    return;
  }
  await apiClient.post<unknown>('/lectures', toLectureBody(req));
}

// 강의 수정 — 강의 상세 헤더의 "수정하기"(연필). 생성 모달의 수정 모드가 이걸 부른다.
export async function updateLecture(req: UpdateProjectRequest): Promise<void> {
  if (USE_MOCK_LECTURE) {
    await delay(300);
    const current = findMockLecture(req.projectId);
    if (!current) throw new Error('수정할 강의를 찾지 못했어요.');
    updateMockLecture({
      ...current,
      title: req.title,
      professorName: req.professor,
      colorIndex: req.colorIndex,
    });
    return;
  }
  // 서버는 professorName이 null이면 기존 값을 유지하므로, 비운 교수명은 빈 문자열로 보낸다.
  await apiClient.patch<unknown>(`/lectures/${req.projectId}`, {
    ...toLectureBody(req),
    professorName: req.professor ?? '',
  });
}

// 강의 삭제 — 수정 모달 왼쪽 아래의 "삭제하기". 되돌릴 수 없으므로 화면이 먼저
// ConfirmModal로 묻고, 그 답이 온 뒤에만 여기 닿는다.
export async function deleteLecture(projectId: number): Promise<void> {
  if (USE_MOCK_LECTURE) {
    await delay(300);
    if (!findMockLecture(projectId)) {
      throw new Error('삭제할 강의를 찾지 못했어요.');
    }
    removeMockLecture(projectId);
    return;
  }
  await apiClient.delete<void>(`/lectures/${projectId}`);
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
      chapterId: Date.now(),
      projectId: req.projectId,
      chapterNumber: nextMockChapterNumber(),
      title: req.title,
      // STT·요약이 끝나기 전이라 아직 아무도 학습하지 않은 상태다.
      createdAt: new Date().toISOString(),
      status: 'BEFORE',
      reviewCount: 0, // 새로 만든 주차는 아직 아무도 안 읽었다
      lectureDate: req.lectureDate,
      professor: req.professor,
      materialFileName: req.materialFile?.name ?? null,
      audioFileName: req.audioFile?.name ?? null,
    };
    // 백엔드가 파일을 보관하기 전까지는 브라우저가 들고 있다가 뷰어에 그대로 넘긴다.
    // 파일을 먼저 넣는 이유는, 저장이 실패했는데 주차만 생겨 "올렸는데 자료가 없다"가
    // 되는 걸 막기 위해서다.
    await saveMaterialFile(chapter.chapterId, req.materialFile);
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
    await saveMaterialFile(chapter.chapterId, req.materialFile);
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
