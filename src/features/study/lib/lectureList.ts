// src/features/study/lib/lectureList.ts
// 학습하기(강의 목록) 화면의 검색·정렬 규칙. 화면 상태와 분리해 순수 함수로 둔다.
import type { ProjectSummary } from '@/shared/types/api';

export type SortKey = 'REGISTERED' | 'NAME';

export const SORT_LABEL: Record<SortKey, string> = {
  REGISTERED: '등록순',
  NAME: '가나다순',
};

// 시안 placeholder가 "강의 명 또는 키워드"라 교수명까지 검색 대상으로 본다.
export function filterLectures(
  lectures: ProjectSummary[],
  keyword: string,
): ProjectSummary[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return lectures;
  return lectures.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.professor.toLowerCase().includes(q),
  );
}

// 쿼리 캐시의 배열을 그대로 받으므로 원본을 건드리지 않도록 복사 후 정렬한다.
export function sortLectures(
  lectures: ProjectSummary[],
  key: SortKey,
): ProjectSummary[] {
  const sorted = [...lectures];
  if (key === 'NAME') {
    return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
  }
  return sorted.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
