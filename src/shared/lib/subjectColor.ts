// src/shared/lib/subjectColor.ts
// 과목(강의)을 색으로 가른다. 캘린더 일정 점·사이드바 강의 점·강의 카드 점이 같은 것을 쓴다 —
// 같은 과목이 화면마다 다른 색이면 색으로 잇는다는 목적 자체가 없어진다.

import type { Project } from '@/shared/types/api';

// Tailwind는 소스에 그대로 적힌 클래스만 만든다. 조합하지 말고 문자열로 박아 둔다.
// 순서·개수는 globals.css의 과목 색과 같아야 한다. 번호(Project.colorIndex)는 1부터.
// 이름은 색 고르기 칩을 보조기기에 읽어 주는 용도다.
export const SUBJECT_COLORS = [
  { dot: 'bg-subject-1', name: '노랑' },
  { dot: 'bg-subject-2', name: '파랑' },
  { dot: 'bg-subject-3', name: '코랄' },
  { dot: 'bg-subject-4', name: '초록' },
  { dot: 'bg-subject-5', name: '라벤더' },
  { dot: 'bg-subject-6', name: '주황' },
  { dot: 'bg-subject-7', name: '분홍' },
  { dot: 'bg-subject-8', name: '민트' },
  { dot: 'bg-subject-9', name: '올리브' },
] as const;

export const SUBJECT_COLOR_COUNT = SUBJECT_COLORS.length;

// 강의를 안 고른 TODO 등 과목이 없는 일정.
export const NO_SUBJECT_DOT_CLASS = 'bg-gray-500';

type SubjectColorSource = Pick<
  Project,
  'projectId' | 'createdAt' | 'colorIndex'
>;

function isColorIndex(value: number | null): value is number {
  return (
    value !== null &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= SUBJECT_COLOR_COUNT
  );
}

/** 팔레트 번호 → 점 클래스. 번호가 없거나 범위를 벗어나면 회색. */
export function subjectDotClassOf(index: number | null | undefined): string {
  return index !== undefined && isColorIndex(index)
    ? SUBJECT_COLORS[index - 1].dot
    : NO_SUBJECT_DOT_CLASS;
}

/** 아직 안 쓰인 번호 중 가장 앞. 다 쓰였으면 1로 돌아간다. */
export function firstUnusedColorIndex(used: ReadonlySet<number>): number {
  for (let i = 1; i <= SUBJECT_COLOR_COUNT; i++) {
    if (!used.has(i)) return i;
  }
  return 1;
}

/**
 * 과목별 색 번호. 저장된 번호를 먼저 놓고, 없는 과목(공유 강의 등)은 생성 순으로
 * 안 쓰인 번호를 채운다. 화면마다 걸러 보여주기 전의 전체 목록을 넣어야 같은 색이 나온다.
 */
export function buildSubjectColorMap(
  projects: readonly SubjectColorSource[] | undefined,
): Map<string, number> {
  const ordered = [...(projects ?? [])].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const map = new Map<string, number>();
  const used = new Set<number>();

  for (const p of ordered) {
    if (map.has(p.projectId) || !isColorIndex(p.colorIndex)) continue;
    map.set(p.projectId, p.colorIndex);
    used.add(p.colorIndex);
  }
  // 팔레트가 다 차면 생성 순으로 한 바퀴 돌아 겹친다.
  let overflow = 0;
  for (const p of ordered) {
    if (map.has(p.projectId)) continue;
    const index =
      used.size < SUBJECT_COLOR_COUNT
        ? firstUnusedColorIndex(used)
        : (overflow++ % SUBJECT_COLOR_COUNT) + 1;
    map.set(p.projectId, index);
    used.add(index);
  }
  return map;
}

/** 목록에 없는 과목(삭제됐거나 아직 안 불러온 것)도 회색으로 떨어뜨린다. */
export function subjectDotClass(
  map: ReadonlyMap<string, number>,
  subjectId: string | null,
): string {
  if (subjectId === null) return NO_SUBJECT_DOT_CLASS;
  return subjectDotClassOf(map.get(subjectId));
}
