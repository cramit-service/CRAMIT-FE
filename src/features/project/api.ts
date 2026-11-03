// src/features/project/api.ts
import type {
  Chapter,
  CreateChapterRequest,
  CreateProjectRequest,
  UpdateChapterRequest,
  UpdateProjectRequest,
  UploadUrlResponse,
  WeekCreateResponse,
} from '@/shared/types/api';
import {
  ApiRequestError,
  UPLOAD_ABORTED,
  apiClient,
  type UploadOptions,
} from '@/shared/lib/apiClient';
import {
  measureAudioDuration,
  putToStorage,
} from '@/features/project/lib/upload';
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
const USE_MOCK = false;

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
  if (USE_MOCK) {
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
  if (USE_MOCK) {
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
  if (USE_MOCK) {
    await delay(300);
    if (!findMockLecture(projectId)) {
      throw new Error('삭제할 강의를 찾지 못했어요.');
    }
    removeMockLecture(projectId);
    return;
  }
  await apiClient.delete<void>(`/lectures/${projectId}`);
}

const uploadAborted = () =>
  new ApiRequestError(UPLOAD_ABORTED, '업로드를 취소했어요.', 0);

const invalidResponse = () =>
  new ApiRequestError('INVALID_RESPONSE', '서버 응답을 해석할 수 없어요.', 0);

// 주소가 비어 있으면 PUT이 엉뚱한 곳으로 가거나 주차에 빈 파일 주소가 저장된다. 여기서 끊는다 (#48).
function toUploadUrl(r: UploadUrlResponse): UploadUrlResponse {
  if (
    typeof r?.uploadUrl !== 'string' ||
    r.uploadUrl === '' ||
    typeof r.fileUrl !== 'string' ||
    r.fileUrl === ''
  ) {
    throw invalidResponse();
  }
  return { uploadUrl: r.uploadUrl, fileUrl: r.fileUrl };
}

const requestUploadUrl = async (
  file: File,
  fileType: 'PPT' | 'AUDIO',
  signal?: AbortSignal,
) =>
  toUploadUrl(
    await apiClient.post<UploadUrlResponse>(
      '/files/presigned-url',
      { fileName: file.name, fileType },
      { signal },
    ),
  );

// 새 주차(챕터) 업로드. 파일은 저장소에 직접 올리고(발급 → PUT), 주차 생성에는 주소만 보낸다.
// 화면은 만든 주차로 이동하는 데 id만 쓴다.
export async function createChapter(
  req: CreateChapterRequest,
  options: UploadOptions = {},
): Promise<number> {
  if (USE_MOCK) {
    // 파일 크기와 무관하게 늘 같은 시간이 걸리면 업로드 느낌이 안 나서 조금 길게 둔다.
    await mockUpload(options, 2400);
    const chapter: Chapter = {
      chapterId: Date.now(),
      projectId: req.projectId,
      chapterNumber: nextMockChapterNumber(),
      title: req.title,
      createdAt: new Date().toISOString(),
      status: 'BEFORE',
      reviewCount: 0,
      lectureDate: req.lectureDate,
      materialFileName: req.materialFile?.name ?? null,
      audioFileName: req.audioFile?.name ?? null,
    };
    // 백엔드가 파일을 보관하기 전까지는 브라우저가 들고 있다가 뷰어에 그대로 넘긴다.
    await saveMaterialFile(chapter.chapterId, req.materialFile);
    addMockChapter(chapter);
    return chapter.chapterId;
  }

  const { onProgress, signal } = options;
  const { materialFile, audioFile } = req;
  try {
    const [durationSec, ppt, audio] = await Promise.all([
      audioFile ? measureAudioDuration(audioFile) : null,
      materialFile ? requestUploadUrl(materialFile, 'PPT', signal) : null,
      audioFile ? requestUploadUrl(audioFile, 'AUDIO', signal) : null,
    ]);

    // 진행률은 두 파일을 합친 바이트 기준이다. 파일마다 0부터 다시 차면 막대가 뒤로 간다.
    const total = (materialFile?.size ?? 0) + (audioFile?.size ?? 0);
    let sent = 0;
    for (const [file, target] of [
      [materialFile, ppt],
      [audioFile, audio],
    ] as const) {
      if (!file || !target) continue;
      await putToStorage(target.uploadUrl, file, {
        signal,
        onProgress: (ratio) => onProgress?.((sent + ratio * file.size) / total),
      });
      sent += file.size;
    }

    const created = await apiClient.post<WeekCreateResponse>(
      `/lectures/${req.projectId}/weeks`,
      {
        title: req.title,
        weekDate: req.lectureDate,
        ppt:
          materialFile && ppt
            ? {
                fileName: materialFile.name,
                fileUrl: ppt.fileUrl,
                fileSize: materialFile.size,
              }
            : null,
        audio:
          audioFile && audio
            ? { fileName: audioFile.name, fileUrl: audio.fileUrl, durationSec }
            : null,
      },
      { signal },
    );
    if (typeof created?.weekId !== 'number') throw invalidResponse();
    return created.weekId;
  } catch (error) {
    // 발급·생성 요청 도중 멈추면 apiClient는 취소를 그대로 던진다. 화면은 취소를
    // UPLOAD_ABORTED로 알아보므로(문구 없이 폼으로 돌아감) 여기서 맞춘다.
    if (signal?.aborted) throw uploadAborted();
    throw error;
  }
}

// 주차(챕터) 수정 — 학습 화면 헤더에서 제목을 눌러 고친다.
// 파일 교체는 백엔드에 아직 없어 제목·날짜만 보낸다.
export async function updateChapter(
  req: UpdateChapterRequest,
  options: UploadOptions = {},
): Promise<void> {
  if (USE_MOCK) {
    await mockUpload(options, 1600);
    const current = findMockChapter(req.chapterId);
    if (!current) throw new Error('수정할 주차를 찾지 못했어요.');
    updateMockChapter({
      ...current,
      projectId: req.projectId,
      title: req.title,
      lectureDate: req.lectureDate,
    });
    return;
  }
  await apiClient.patch<unknown>(
    `/weeks/${req.chapterId}`,
    { title: req.title, weekDate: req.lectureDate },
    { signal: options.signal },
  );
}
