// src/shared/lib/cn.ts
import { extendTailwindMerge, type ClassNameValue } from 'tailwind-merge';

// twMerge는 text-*가 크기인지 색인지 이름으로 판단한다. globals.css의 타이포 토큰은
// 기본 목록에 없어서 색으로 오해받고, 같은 cn() 안의 text-<색>에 밀려 지워진다.
// 토큰을 추가할 때 이 목록도 같이 늘린다.
const TEXT_TOKENS = [
  'heading-lg',
  'heading-md',
  'heading-sm',
  'body-lg',
  'body-md',
  'body',
  'body-sm',
  'button-lg',
  'button-sm',
  'label',
];

const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: TEXT_TOKENS }] } },
});

// 겹치는 클래스는 나중 인자가 이긴다. 단순 concat이면 승자가 Tailwind의 클래스 생성
// 순서로 정해져, 호출처에서 컴포넌트 기본값을 덮어쓸 수 없다.
export function cn(...classes: ClassNameValue[]) {
  return twMerge(classes);
}
