// src/shared/lib/routeId.ts
import { notFound } from 'next/navigation';

// 주소창의 ID는 문자열이다. 서버 ID(Long, 1부터)로 바꿀 수 없으면 없는 페이지로 처리한다 —
// 그대로 Number()만 하면 NaN이 조회 키와 API 경로까지 내려간다.
export function toRouteId(value: string): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  return id;
}
