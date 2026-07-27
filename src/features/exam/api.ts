// src/features/exam/api.ts
import type { Exam } from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import { toLocalDateString } from '@/shared/lib/date';
import { mockExams } from '@/mocks/exam';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = true;

// 가짜 지연을 흉내내는 헬퍼 (실제 네트워크처럼 잠깐 기다림).
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
    // 백엔드 계약을 흉내낸다: 다가오는 시험만(오늘 포함) 골라 시험일 오름차순으로 준다.
    // 실제 서버가 할 일을 mock이 대신하는 것이라, USE_MOCK을 꺼도 화면 로직은 그대로다.
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
    // filter가 없으니 원본 배열을 건드리지 않도록 복사 후 정렬한다.
    return [...mockExams].sort((a, b) => a.examDate.localeCompare(b.examDate));
  }
  return apiClient.get<Exam[]>('/exams', { signal });
}
