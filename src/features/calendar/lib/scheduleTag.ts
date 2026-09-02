// src/features/calendar/lib/scheduleTag.ts
// 캘린더 일정 태그(셀 안 태그 + 범례)의 생김새를 한 곳에서 정한다.
// 범례는 셀 태그가 무엇인지 설명하는 물건이라 둘이 다르게 생기면 범례 구실을 못 한다.
// 예전에는 두 곳이 같은 클래스 문자열을 각자 들고 있어 한쪽만 바뀌면 조용히 어긋났다.
// (exam/lib/dday.ts의 ddayBadgeClass가 시험 목록·홈 배너를 묶는 것과 같은 방식)

export type ScheduleType = 'exam' | 'todo';

// 태그 한 개의 공통 생김새.
// 왼쪽 2px 색 바는 before로 그린다 — 진짜 요소로 넣으면 글자가 익명 플렉스 아이템이 되어
// truncate의 말줄임이 먹지 않는다(shared/ui/FormModal의 OPTION_ROW와 같은 이유).
// before가 absolute라 relative가 필수다(CLAUDE.md 4-5). 바는 4~6px에 놓이고
// pl-2(8px)이 글자를 그 뒤로 밀어 둔다. truncate의 overflow:hidden 안쪽이라 잘리지 않는다.
export const SCHEDULE_TAG_BASE =
  'relative w-fit max-w-full truncate py-0.75 pr-1 pl-2 text-[12px] leading-3.75 font-normal ' +
  'before:absolute before:top-1/2 before:left-1 before:h-2.5 before:w-0.5 before:-translate-y-1/2 before:rounded-full';

// 시험=노랑(warning), 투두=파랑(secondary) — 색 규칙은 팀 합의값.
//
// 색만으로 종류를 구분하면 색각 이상 사용자에게 두 태그가 같아 보인다(WCAG 1.4.1).
// 그래서 모서리를 함께 가른다: 투두는 알약(rounded-full), 시험은 각진 모서리(rounded-sm).
// 왼쪽 바는 색 앵커를 맡고, 종류를 실제로 전하는 건 모서리다 — 색을 걷어내도 구분이 남는다.
// 가로 비용이 0이라 375px에서 셀 폭이 36px뿐인 상황에서도 글자 자리를 뺏지 않는다.
//
// 주의: 이 노랑·파랑은 dday.ts의 뱃지 색과 뜻이 다르다.
// 거기서는 노랑=D-1~3(긴급)·파랑=D-4+(여유)라 같은 색이 한 화면에서 두 사전을 갖는다.
// 그건 두 색 체계 중 하나를 다시 칠해야 풀리는 시안 차원의 문제라 여기서는 건드리지 않았다.
export function scheduleTagClass(type: ScheduleType): string {
  return type === 'exam'
    ? 'rounded-sm bg-level-02/30 text-warning before:bg-warning'
    : 'rounded-full bg-secondary-100 text-secondary-500 before:bg-secondary-500';
}
