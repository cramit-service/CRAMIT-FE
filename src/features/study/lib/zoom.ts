// src/features/study/lib/zoom.ts

// 판에 꽉 맞춘 크기(1)에서 시작해 키우기만 한다. 맞춤보다 작게 볼 일이 없다.
export const ZOOM_STEPS = [1, 1.25, 1.5, 2, 3] as const;
export const MIN_ZOOM = ZOOM_STEPS[0];
export const MAX_ZOOM = ZOOM_STEPS[ZOOM_STEPS.length - 1];

export type ZoomDirection = 1 | -1;

// 한 단계 키우거나 줄인다. 양 끝에서는 그대로다.
export function stepZoom(zoom: number, direction: ZoomDirection): number {
  const found = ZOOM_STEPS.findIndex((step) => step >= zoom);
  const index = found === -1 ? ZOOM_STEPS.length - 1 : found;
  const next = Math.min(Math.max(index + direction, 0), ZOOM_STEPS.length - 1);
  return ZOOM_STEPS[next];
}

export function formatZoom(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}
