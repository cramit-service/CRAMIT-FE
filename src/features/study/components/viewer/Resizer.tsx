'use client';
// src/features/study/components/viewer/Resizer.tsx

// 좌우 폭을 끌어서 바꾸는 세로 드래그 핸들.
// 학습 뷰어에서 두 곳에 쓴다 — PDF 탭 안의 페이지 목록 폭, 이분할 화면의 좌우 패널 비율.
// Figma에선 두 곳 모두 같은 부품(6×51 회색 알약)이다.

interface ResizerProps {
  value: number; // 현재 값 (px 또는 %)
  min: number;
  max: number;
  onResize: (value: number) => void;
  // 스크린리더용 이름. 무엇의 폭을 조절하는지 쓰는 곳마다 다르다.
  label: string;
  // 포인터 이동 1px을 value 몇 만큼으로 볼지. px 단위로 쓰면 1(기본),
  // %로 쓰면 100/컨테이너폭을 넘긴다.
  scale?: number;
  // 화살표 키 한 번에 움직일 값
  step?: number;
  // 어두운 패널 안에서 쓸 때만 세로 구분선을 그린다.
  // 밝은 배경 위(이분할 화면)에선 선이 떠 보여서 알약만 남긴다.
  divider?: boolean;
}

export function Resizer({
  value,
  min,
  max,
  onResize,
  label,
  scale = 1,
  step = 8,
  divider = false,
}: ResizerProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  // 포인터를 잡아두고(setPointerCapture) 이동량만큼 값을 늘리고 줄인다
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handle = e.currentTarget;
    const startX = e.clientX;
    const startValue = value;

    const handleMove = (move: PointerEvent) => {
      onResize(clamp(startValue + (move.clientX - startX) * scale));
    };
    // 터치 취소나 capture 해제로 끝날 수도 있다. pointerup만 정리하면
    // 남은 pointermove 핸들러가 다음 드래그에서 onResize를 중복 호출한다.
    const handleEnd = () => {
      handle.removeEventListener('pointermove', handleMove);
      handle.removeEventListener('pointerup', handleEnd);
      handle.removeEventListener('pointercancel', handleEnd);
      handle.removeEventListener('lostpointercapture', handleEnd);
    };

    handle.setPointerCapture(e.pointerId);
    handle.addEventListener('pointermove', handleMove);
    handle.addEventListener('pointerup', handleEnd);
    handle.addEventListener('pointercancel', handleEnd);
    handle.addEventListener('lostpointercapture', handleEnd);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onResize(clamp(value - step));
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onResize(clamp(value + step));
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className="group relative flex w-3 shrink-0 cursor-col-resize touch-none items-center justify-center focus:outline-none"
    >
      {divider && <span className="absolute inset-y-0 w-px bg-gray-800" />}
      {/* 가운데 잡는 부분 (Figma: 6×51 회색 알약) */}
      <span className="group-focus:bg-secondary-400 relative h-9 w-1 rounded-full bg-gray-500 transition-colors group-hover:bg-gray-400" />
    </div>
  );
}
