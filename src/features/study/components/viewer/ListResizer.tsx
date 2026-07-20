'use client';
// src/features/study/components/viewer/ListResizer.tsx

// 좌측 페이지 목록과 우측 미리보기 사이의 드래그 핸들.
// Figma: 세로 구분선 + 가운데 회색 알약(gray-500). 좌우로 끌어 좌측 목록 폭을 바꾼다.
// 폭이 좁아지면 목록이 썸네일 → 페이지 번호(P.01) 표시로 바뀐다.

interface ListResizerProps {
  width: number; // 현재 좌측 목록 폭(px)
  min: number;
  max: number;
  onResize: (width: number) => void;
}

// 키보드로도 조절할 수 있게 화살표 한 번당 움직일 폭
const STEP = 8;

export function ListResizer({ width, min, max, onResize }: ListResizerProps) {
  const clamp = (value: number) => Math.min(max, Math.max(min, value));

  // 포인터를 잡아두고(setPointerCapture) 이동량만큼 좌측 폭을 늘리고 줄인다
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handle = e.currentTarget;
    const startX = e.clientX;
    const startWidth = width;

    const handleMove = (move: PointerEvent) => {
      onResize(clamp(startWidth + (move.clientX - startX)));
    };
    const handleUp = () => {
      handle.removeEventListener('pointermove', handleMove);
      handle.removeEventListener('pointerup', handleUp);
    };

    handle.setPointerCapture(e.pointerId);
    handle.addEventListener('pointermove', handleMove);
    handle.addEventListener('pointerup', handleUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onResize(clamp(width - STEP));
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onResize(clamp(width + STEP));
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="페이지 목록 너비 조절"
      aria-valuenow={Math.round(width)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className="group relative flex w-3 shrink-0 cursor-col-resize touch-none items-center justify-center focus:outline-none"
    >
      {/* 세로 구분선 */}
      <span className="absolute inset-y-0 w-px bg-gray-800" />
      {/* 가운데 잡는 부분 (Figma: 6×51 회색 알약) */}
      <span className="group-focus:bg-secondary-400 relative h-9 w-1 rounded-full bg-gray-500 transition-colors group-hover:bg-gray-400" />
    </div>
  );
}
