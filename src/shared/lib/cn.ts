// src/shared/lib/cn.ts
import { twMerge, type ClassNameValue } from 'tailwind-merge';

// 겹치는 클래스는 나중 인자가 이긴다. 단순 concat이면 승자가 Tailwind의 클래스 생성
// 순서로 정해져, 호출처에서 컴포넌트 기본값을 덮어쓸 수 없다.
export function cn(...classes: ClassNameValue[]) {
  return twMerge(classes);
}
