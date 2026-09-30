// src/shared/lib/cn.ts
import { extendTailwindMerge, type ClassNameValue } from 'tailwind-merge';

// twMerge는 클래스가 어느 그룹인지 '이름'으로 판단한다. globals.css가 만든 토큰은
// twMerge의 목록에 없어서 엉뚱한 그룹으로 분류되고, 같은 cn() 안에서 진짜 그 그룹에
// 속한 클래스에 밀려 지워지거나, 반대로 싸워야 할 상대와 안 싸운다.
//
// 걸리는 자리가 둘이고 증상이 반대다.
//  - text-*  : 크기 토큰이 '색'으로 분류돼 text-<색>에 밀려 사라진다.
//  - shadow-*: 단계 토큰이 '색'으로 분류돼 shadow-none·shadow-lg와 안 싸운다.
//              그래서 shadow-far와 shadow-none이 같이 살아남아 그림자가 안 꺼진다.
//
// 토큰을 늘리면 이 목록과 scripts/check-cn.mjs에 같이 넣는다.
// 둘 다 안 넣어도 린트·타입·빌드가 전부 통과한다 — 화면에서 조용히 틀릴 뿐이다.
const TEXT_TOKENS = [
  'heading-lg',
  'heading-md',
  'heading-sm',
  'body-lg',
  'body-md',
  'body',
  'body-sm',
  'label',
];

const SHADOW_TOKENS = ['far', 'near'];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: TEXT_TOKENS }],
      shadow: [{ shadow: SHADOW_TOKENS }],
    },
  },
});

// 겹치는 클래스는 나중 인자가 이긴다. 단순 concat이면 승자가 Tailwind의 클래스 생성
// 순서로 정해져, 호출처에서 컴포넌트 기본값을 덮어쓸 수 없다.
export function cn(...classes: ClassNameValue[]) {
  return twMerge(classes);
}
