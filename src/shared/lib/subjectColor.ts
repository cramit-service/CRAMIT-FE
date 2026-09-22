// src/shared/lib/subjectColor.ts
// 과목(강의)을 색으로 가른다. 캘린더 일정 점과 사이드바 강의 점이 같은 것을 쓴다 —
// 같은 과목이 두 화면에서 다른 색이면 색으로 잇는다는 목적 자체가 없어진다.
// shared에 두는 이유가 그것이다(features/calendar와 shared/ui/Sidebar가 함께 쓴다).

import type { ProjectSummary } from '@/shared/types/api';

// Tailwind는 소스에 그대로 적힌 클래스만 만든다. 조합하지 말고 문자열로 박아 둔다.
// 개수는 globals.css의 과목 색과 같아야 한다.
export const SUBJECT_DOT_CLASSES = [
  'bg-subject-1',
  'bg-subject-2',
  'bg-subject-3',
  'bg-subject-4',
  'bg-subject-5',
  'bg-subject-6',
  'bg-subject-7',
  'bg-subject-8',
  'bg-subject-9',
] as const;

// 강의를 안 고른 TODO 등 과목이 없는 일정.
export const NO_SUBJECT_DOT_CLASS = 'bg-gray-500';

/**
 * 색 배정의 기준 순서. 두 화면이 같은 색을 쓰려면 같은 목록을 같은 순서로 봐야 하므로
 * 정렬 규칙을 여기 한 곳에만 둔다 — 화면에서 어떻게 걸러 보여주든(내 강의/공유 강의)
 * 배정은 항상 전체 목록의 생성 순서를 탄다.
 */
export function subjectIdsInCreationOrder(
  projects: ProjectSummary[] | undefined,
): string[] {
  return [...(projects ?? [])]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((p) => p.projectId);
}

/** 생성 순으로 정렬된 과목 id 목록 → 과목별 점 클래스. */
export function buildSubjectDotMap(
  orderedSubjectIds: readonly string[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const id of orderedSubjectIds) {
    if (map.has(id)) continue;
    map.set(id, SUBJECT_DOT_CLASSES[map.size % SUBJECT_DOT_CLASSES.length]);
  }
  return map;
}

/** 목록에 없는 과목(삭제됐거나 아직 안 불러온 것)도 회색으로 떨어뜨린다. */
export function subjectDotClass(
  map: Map<string, string>,
  subjectId: string | null,
): string {
  if (subjectId === null) return NO_SUBJECT_DOT_CLASS;
  return map.get(subjectId) ?? NO_SUBJECT_DOT_CLASS;
}
