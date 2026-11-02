// src/features/exam/api.ts
import type {
  CreateExamRequest,
  Exam,
  ExamResponse,
  UpdateExamRequest,
} from '@/shared/types/api';
import { ApiRequestError, apiClient } from '@/shared/lib/apiClient';
import { toLocalDateString } from '@/shared/lib/date';
import {
  addMockExam,
  mockExams,
  removeMockExam,
  updateMockExam,
} from '@/mocks/exam';
import { mockProjectSummaries } from '@/mocks/project';

// 강의명은 원래 서버가 lectureId로 채워 내려주는 값이다. mock이 그 역할을 대신한다.
const mockLectureName = (lectureId: number): string | null =>
  mockProjectSummaries.find((p) => p.projectId === lectureId)?.title ?? null;

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = false;

// 쿼리가 취소되면 실제 fetch처럼 즉시 중단되도록 AbortSignal을 받는다. (study/api.ts와 동일 패턴)
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

const EXAM_DATE = /^\d{4}-\d{2}-\d{2}$/;

const invalid = () =>
  new ApiRequestError('INVALID_RESPONSE', '시험 일정을 해석할 수 없어요.', 0);

// 응답 → 화면. 서버는 강의를 lectureId로, 화면은 같은 값을 projectId로 부른다.
// examDate가 어긋나면 D-day 계산부터 깨지므로 여기서 끊는다 (#48).
function toExam(r: ExamResponse): Exam {
  if (
    typeof r?.examId !== 'number' ||
    typeof r.lectureId !== 'number' ||
    typeof r.title !== 'string' ||
    (r.lectureName !== null && typeof r.lectureName !== 'string') ||
    typeof r.examDate !== 'string' ||
    !EXAM_DATE.test(r.examDate) ||
    (r.memo !== null && typeof r.memo !== 'string') ||
    typeof r.createdAt !== 'string'
  ) {
    throw invalid();
  }
  return {
    examId: r.examId,
    projectId: r.lectureId,
    title: r.title,
    lectureName: r.lectureName,
    examDate: r.examDate,
    memo: r.memo,
    createdAt: r.createdAt,
  };
}

function toExams(list: ExamResponse[]): Exam[] {
  if (!Array.isArray(list)) throw invalid();
  return list.map(toExam);
}

// 다가오는 시험 일정 조회 — 홈 대시보드 리스트/배너용.
// 내 전체 시험 중 "다가오는 것(오늘 포함)"만 시험일 오름차순으로 준다.
export async function getExams(signal?: AbortSignal): Promise<Exam[]> {
  if (USE_MOCK) {
    await delay(300, signal);
    // 필터·정렬은 원래 서버가 할 일이다. mock이 대신해야 USE_MOCK을 꺼도 화면 로직이 그대로다.
    const today = toLocalDateString(new Date());
    return toExams(
      mockExams
        .filter((exam) => exam.examDate >= today)
        .sort((a, b) => a.examDate.localeCompare(b.examDate)),
    );
  }
  return toExams(
    await apiClient.get<ExamResponse[]>('/exams/upcoming', { signal }),
  );
}

// 시험 일정 생성 — 홈 "다가오는 시험 일정" 추가하기 모달.
// 화면은 목록을 다시 불러 그리므로 응답 본문은 쓰지 않는다.
export async function createExam(req: CreateExamRequest): Promise<void> {
  const { projectId, ...body } = req;
  if (USE_MOCK) {
    await delay(300);
    addMockExam({
      examId: Date.now(),
      lectureId: projectId,
      lectureName: mockLectureName(projectId),
      ...body,
      createdAt: new Date().toISOString(),
    });
    return;
  }
  await apiClient.post<unknown>(`/lectures/${projectId}/exams`, body);
}

// 시험 일정 수정 — 같은 모달의 수정 모드.
export async function updateExam(req: UpdateExamRequest): Promise<void> {
  const { examId, projectId, ...rest } = req;
  if (USE_MOCK) {
    await delay(300);
    const current = mockExams.find((e) => e.examId === examId);
    // 목록에 없는 걸 고치려는 상황(다른 기기에서 이미 지웠다든지)은 서버가 404로 답할 자리다.
    if (!current) throw new Error('시험 일정을 찾을 수 없어요.');
    updateMockExam({
      ...current,
      ...rest,
      lectureId: projectId,
      lectureName: mockLectureName(projectId),
    });
    return;
  }
  await apiClient.patch<unknown>(`/exams/${examId}`, {
    ...rest,
    lectureId: projectId,
  });
}

// 시험 일정 삭제. 시안에 확인 단계가 없어 누르는 즉시 지운다.
export async function deleteExam(examId: number): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    removeMockExam(examId);
    return;
  }
  await apiClient.delete<void>(`/exams/${examId}`);
}
