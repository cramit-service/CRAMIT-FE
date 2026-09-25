// src/shared/ui/fieldStyle.ts
// DESIGN.md §4 "A field has no border until it has something to say" /
// "The list is one specification".
//
// 네 가지가 목록에서 고른다 — Combobox·DateField·TimeField·Select. 트리거는 다르고
// 목록은 같다. 목록을 띄우는 위치는 각자가 알아서 정하므로(자기 패널 안) 여기엔
// 생김새만 둔다. 클래스 문자열로 두는 이유는 그 셋이 이미 자기 DOM을 갖고 있어서다.
import { H_CONFIRM, H_OPTION, TEXT_CONTROL } from '@/shared/ui/control';

/** 값을 들고 있는 칸. 채움이 곧 필드이고, 테두리는 할 말이 있을 때만 나온다.
 *  쉬는 상태에도 투명한 테두리를 두는 건 포커스가 들어올 때 칸이 커지지 않게 하려는 것. */
export const FIELD_TRIGGER = `${H_CONFIRM} ${TEXT_CONTROL} bg-well w-full rounded-md border border-transparent px-4.5 text-gray-700 outline-none transition-colors duration-150 ease-out focus:border-sky-ink`;

/** 아직 고르지 않았을 때의 글자. */
export const FIELD_PLACEHOLDER = 'text-gray-500';

/** 칸 위에 붙는 이름. */
export const FIELD_LABEL = `${TEXT_CONTROL} font-medium text-gray-700`;

/** 틀렸다는 말과, 그때의 테두리. */
export const FIELD_ERROR = `${TEXT_CONTROL} text-red-ink`;
export const FIELD_INVALID = 'border-red-ink';

/** 펼쳐지는 목록 한 판. 다섯 줄(40×5) 뒤에 스크롤한다 — 들어가는 만큼이 아니라
 *  세어서 정한 값이라 어디서 열리든 같은 크기다.
 *  위치(top-full / bottom-full)는 여는 쪽이 붙인다. */
export const OPTION_LIST =
  'shadow-near bg-surface z-10 max-h-[200px] w-full overflow-y-auto rounded-md py-1';

/** 목록 한 줄. */
export const OPTION_ROW = `${H_OPTION} ${TEXT_CONTROL} flex cursor-pointer items-center px-4.5 font-medium transition-colors duration-150 ease-out`;

/** 줄의 상태별 채움.
 *  고름과 호버가 둘 다 채움인데 부딪히지 않는다 — §2의 누름 규칙이 합성되기 때문이다.
 *  lime-action 위의 검정 8%가 lime-hover와 같은 값이라, 고른 줄에 커서가 올라간 상태는
 *  나머지 둘 어느 쪽도 아니면서 자기 값을 따로 정할 필요가 없다.
 *  TODO: 흰 줄 위의 8%는 #ebebeb인데 토큰이 없다. well(#f0f1f1)로 근사해 뒀다. */
export function optionStateClass({
  selected,
  active,
}: {
  selected: boolean;
  /** 키보드 하이라이트 또는 마우스 오버 */
  active: boolean;
}) {
  if (selected)
    return active
      ? 'bg-lime-hover text-gray-800'
      : 'bg-lime-action text-gray-800';
  if (active) return 'bg-well text-gray-700';
  return 'text-gray-700';
}
