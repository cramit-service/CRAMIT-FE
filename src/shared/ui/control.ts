// src/shared/ui/control.ts
// 컨트롤 한 칸 = 높이 + 그 안의 글자. DESIGN.md §2 Control height × §3 Typography.
//
// 묶어 둔 것이 이 파일의 요점이다. 높이만 내리면 글자가 그 자리에 남아 답답해지고,
// 글자만 내리면 높이가 그대로라 헐거워진다. 한쪽만 바꾸는 일이 생기지 않도록
// 아예 한 칸으로 만들었다 — 고를 수 있는 건 칸이지 높이가 아니다.
//
// 단계 이름은 §2 Control height의 것을 그대로 쓴다. 역할 이름(확정·줄 안 …)을 붙여 봤다가
// 걷어냈다: 어떤 화면이 어느 역할인지는 매번 판단이 필요한데, 정작 순위는 높이가 아니라
// 채움 대 테두리와 위치가 말한다(§4). 판단만 남고 얻는 게 없었다.
//
// 짝은 줄상자 위아래로 남는 여백과 높이/글자 비율을 같이 보고 정했다. 한 칸 내려갈 때마다
// 눈에 띄는 것이 하나씩 바뀌어야 칸이 칸 구실을 한다 — md에 16px을 주면 lg와 거의 같아
// 보여서, 구분이 안 되는 단계가 램프에 하나 생긴다.
//
//  단계  높이  글자        여백  비율
//  sm     32   label 14      5   2.29   ← §3 램프가 14에서 멈춰 이 칸만 비율이 떨어진다
//  md     40   label 14      9   2.86
//  lg     44   body-sm 16   10   2.75
//  xl     48   body 18      10   2.67
//  2xl    56   body-md 20   13   2.80
const STEP = {
  sm: 'h-8 text-label',
  md: 'h-10 text-label',
  lg: 'h-11 text-body-sm',
  xl: 'h-12 text-body',
  '2xl': 'h-14 text-body-md',
} as const;

export type ControlSize = keyof typeof STEP;

/** 컨트롤이 기본으로 서는 칸. 버튼도 필드도 목록 줄도 여기서 시작한다. */
export const CONTROL_DEFAULT: ControlSize = 'md';

/** 칸 → 높이와 글자. 둘은 항상 같이 나온다. */
export function control(size: ControlSize = CONTROL_DEFAULT): string {
  return STEP[size];
}

/** 목록은 다섯 줄 뒤에 스크롤한다 — 들어가는 만큼이 아니라 세어서 정한 값이라
 *  어디서 열리든 목록이 같은 크기다. */
export const OPTION_ROWS = 5;
