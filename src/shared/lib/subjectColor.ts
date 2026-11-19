// src/shared/lib/subjectColor.ts
// 과목(강의)을 색으로 가른다. 캘린더 일정 점·사이드바 강의 점·강의 카드 점이 같은 것을 쓴다 —
// 같은 과목이 화면마다 다른 색이면 색으로 잇는다는 목적 자체가 없어진다.

import type { Project } from '@/shared/types/api';

// Tailwind는 소스에 그대로 적힌 클래스만 만든다. 조합하지 말고 문자열로 박아 둔다.
// 순서·개수는 globals.css의 과목 색과 같아야 한다. 번호(Project.colorIndex)는 1부터.
// 이름은 색 고르기 칩을 보조기기에 읽어 주는 용도다.
export const SUBJECT_COLORS = [
  { dot: 'bg-subject-1', name: '빨강' },
  { dot: 'bg-subject-2', name: '주황' },
  { dot: 'bg-subject-3', name: '올리브' },
  { dot: 'bg-subject-4', name: '초록' },
  { dot: 'bg-subject-5', name: '청록' },
  { dot: 'bg-subject-6', name: '파랑' },
  { dot: 'bg-subject-7', name: '보라' },
  { dot: 'bg-subject-8', name: '분홍' },
] as const;

export const SUBJECT_COLOR_COUNT = SUBJECT_COLORS.length;

// 강의를 안 고른 TODO 등 과목이 없는 일정.
export const NO_SUBJECT_DOT_CLASS = 'bg-gray-500';

type SubjectColorSource = Pick<Project, 'projectId' | 'colorIndex'>;

// 범위 검사다. 서버가 늘 번호를 채워 주지만 팔레트 밖의 값(0·99)까지 막아 주지는 않는다.
function isColorIndex(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= SUBJECT_COLOR_COUNT;
}

/** 팔레트 번호 → 점 클래스. 번호가 없거나 범위를 벗어나면 회색. */
export function subjectDotClassOf(index: number | null | undefined): string {
  return index != null && isColorIndex(index)
    ? SUBJECT_COLORS[index - 1].dot
    : NO_SUBJECT_DOT_CLASS;
}

/**
 * 과목별 색 번호. 화면마다 걸러 보여주기 전의 전체 목록을 넣어야 같은 색이 나온다.
 *
 * 전에는 번호가 없는 과목을 생성 순으로 채우는 2차 훑기가 있었다. colorIndex가
 * 서버에서 늘 채워져 오기로 정해지면서 채울 것이 없어졌고, 그 훑기가 쓰던 생성 시각
 * 정렬도 같이 사라졌다. 남은 일은 저장된 번호를 지도로 옮기는 것뿐이다.
 */
export function buildSubjectColorMap(
  projects: readonly SubjectColorSource[] | undefined,
): Map<number, number> {
  const map = new Map<number, number>();
  for (const p of projects ?? []) {
    if (!map.has(p.projectId) && isColorIndex(p.colorIndex)) {
      map.set(p.projectId, p.colorIndex);
    }
  }
  return map;
}

/** 목록에 없는 과목(삭제됐거나 아직 안 불러온 것)도 회색으로 떨어뜨린다. */
export function subjectDotClass(
  map: ReadonlyMap<number, number>,
  subjectId: number | null,
): string {
  if (subjectId === null) return NO_SUBJECT_DOT_CLASS;
  return subjectDotClassOf(map.get(subjectId));
}

/**
 * 새 과목이 받을 번호 — 지금 가장 적게 쓰인 색, 같으면 앞 번호.
 *
 * 안 쓰인 색이 있으면 그 색의 쓰임이 0이라 저절로 뽑힌다. 다 쓰였을 때만 "적게 쓰인 쪽"이
 * 갈라 준다. 그래서 규칙이 하나다.
 *
 * 전에는 firstUnusedColorIndex(taken)을 직접 불렀는데, 그 함수는 여덟이 다 차면 늘 1을
 * 돌려준다 — 지도의 2차 훑기는 생성순으로 한 바퀴 도는데(9번째 1, 10번째 2, …) 새 과목만
 * 언제나 빨강으로 시작했다. 같은 상황을 두 규칙이 다르게 답하고 있었다.
 *
 * 목록 뒤에 가상의 과목을 붙여 지도를 다시 돌리는 방법도 써 봤는데, 그건 한 번만 맞는다:
 * 새 과목이 색을 저장하고 나면 1차 훑기에서 바로 배정돼 used가 안 커지고, 오버플로
 * 카운터가 매번 같은 자리에서 시작해 12번째부터 계속 같은 색이 나온다.
 */
export function nextSubjectColorIndex(
  projects: readonly SubjectColorSource[] | undefined,
): number {
  const counts = new Array<number>(SUBJECT_COLOR_COUNT).fill(0);
  for (const index of buildSubjectColorMap(projects).values()) {
    counts[index - 1] += 1;
  }
  let best = 0;
  for (let i = 1; i < SUBJECT_COLOR_COUNT; i++) {
    if (counts[i] < counts[best]) best = i;
  }
  return best + 1;
}
