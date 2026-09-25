// src/shared/ui/control.ts
// 컨트롤의 높이와 그 안의 글자. DESIGN.md §2 Control height / §4 "Two heights, and
// the field shares one".
//
// 한 파일에 모은 이유는 이 값들이 서로 묶여 있어서다. 버튼의 높이는 버튼의 것이 아니라
// 옆에 선 필드에 견주어 읽히는 값이라, 둘이 따로 움직이면 한 줄에서 어긋난다.
// 높이를 바꿔야 하면 여기서 바꾼다 — 부품마다 찾아다니면 반드시 하나를 빠뜨린다.

/** 확정 액션과 그 옆에 서는 필드. §2 control height의 2xl. */
export const H_CONFIRM = 'h-14'; // 56

/** 줄 안에서 일하는 액션 — 헤더, 툴바, 목록. §2의 lg. */
export const H_ROW = 'h-11'; // 44

/** 컨트롤 안의 글자. §4가 정하지 않은 자리라 §3 램프에서 고른 값이다.
 *  높이와 달리 아무것도 붙들고 있지 않으므로 여기만 바꾸면 된다. */
export const TEXT_CONTROL = 'text-body-sm';

/** 목록 한 줄의 높이. §4 "The list is one specification" — 40, 다섯 줄 뒤 스크롤. */
export const H_OPTION = 'h-10';
export const OPTION_ROWS = 5;
