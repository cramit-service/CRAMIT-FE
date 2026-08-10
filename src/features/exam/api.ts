// src/features/exam/api.ts
import type {
  CreateExamRequest,
  Exam,
  UpdateExamRequest,
} from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import { toLocalDateString } from '@/shared/lib/date';
import {
  addMockExam,
  mockExams,
  removeMockExam,
  updateMockExam,
} from '@/mocks/exam';
import { mockProjectSummaries } from '@/mocks/project';

// 강의명은 원래 서버가 projectId로 채워 내려주는 값이다. mock이 그 역할을 대신해야
// USE_MOCK을 꺼도 화면(examName)이 그대로 동작한다. (getExams의 필터·정렬과 같은 이유)
const mockLectureName = (projectId: string): string | null =>
  mockProjectSummaries.find((p) => p.projectId === projectId)?.title ?? null;

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = true;

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

// 다가오는 시험 일정 조회 — 홈 대시보드 리스트/배너용.
// 내 전체 시험 중 "다가오는 것(오늘 포함)"만 시험일 오름차순으로 준다.
// 과거까지 포함한 전체가 필요한 캘린더는 getAllExams를 쓴다.
export async function getExams(signal?: AbortSignal): Promise<Exam[]> {
  if (USE_MOCK) {
    await delay(300, signal);
    // 필터·정렬은 원래 서버가 할 일이다. mock이 대신해야 USE_MOCK을 꺼도 화면 로직이 그대로다.
    const today = toLocalDateString(new Date());
    return mockExams
      .filter((exam) => exam.examDate >= today)
      .sort((a, b) => a.examDate.localeCompare(b.examDate));
  }
  return apiClient.get<Exam[]>('/exams', { signal });
}

// 캘린더용 — 내 전체 시험(과거 포함)을 시험일 오름차순으로 돌려준다.
// 다가오는 것만 필요한 대시보드 리스트/배너는 getExams를 쓴다. (같은 데이터의 다른 뷰)
export async function getAllExams(signal?: AbortSignal): Promise<Exam[]> {
  if (USE_MOCK) {
    await delay(300, signal);
    // sort는 원본을 바꾸므로 복사 후 정렬한다. (getExams는 filter가 만든 새 배열이라 무관)
    return [...mockExams].sort((a, b) => a.examDate.localeCompare(b.examDate));
  }
  return apiClient.get<Exam[]>('/exams', { signal });
}

// 시험 일정 생성 — 홈 "다가오는 시험 일정" 추가하기 모달.
export async function createExam(req: CreateExamRequest): Promise<Exam> {
  if (USE_MOCK) {
    await delay(300);
    const exam: Exam = {
      examId: `e${Date.now()}`,
      projectId: req.projectId,
      title: req.title,
      lectureName: mockLectureName(req.projectId),
      examDate: req.examDate,
      memo: req.memo,
      createdAt: new Date().toISOString(),
      progress: 0, // 방금 만든 시험이라 아직 학습 진행률이 없다
    };
    addMockExam(exam);
    return exam;
  }
  return apiClient.post<Exam>('/exams', req);
}

// 시험 일정 수정 — 같은 모달의 수정 모드.
export async function updateExam(req: UpdateExamRequest): Promise<Exam> {
  if (USE_MOCK) {
    await delay(300);
    const current = mockExams.find((e) => e.examId === req.examId);
    // 목록에 없는 걸 고치려는 상황(다른 기기에서 이미 지웠다든지)은 서버가 404로 답할 자리다.
    if (!current) throw new Error('시험 일정을 찾을 수 없어요.');

    // createdAt·progress는 폼에 없는 값이라 기존 것을 그대로 둔다.
    const exam: Exam = {
      ...current,
      projectId: req.projectId,
      title: req.title,
      lectureName: mockLectureName(req.projectId),
      examDate: req.examDate,
      memo: req.memo,
    };
    updateMockExam(exam);
    return exam;
  }

  const { examId, ...body } = req;
  return apiClient.patch<Exam>(`/exams/${examId}`, body);
}

// 시험 일정 삭제. 시안에 확인 단계가 없어 누르는 즉시 지운다.
export async function deleteExam(examId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    removeMockExam(examId);
    return;
  }
  await apiClient.delete<void>(`/exams/${examId}`);
}
