'use client';
// src/features/todo/hooks/useLongPress.ts
import { useEffect, useRef, useState } from 'react';

// 짧게 누르면 onPress, 눌러서 이 시간만큼 유지하면 onLongPress.
const DELAY_MS = 500;
// 이만큼 넘게 움직이면 "누른 것"이 아니라 스크롤로 본다.
const MOVE_TOLERANCE_PX = 10;

interface UseLongPressOptions {
  onLongPress: () => void;
  onPress: () => void;
}

// 짧은 누름을 click이 아니라 pointerup에서 판정한다.
// click을 쓰면 "길게 누르기가 발동했으니 뒤따라올 click 한 번을 삼킨다"는 플래그가 필요한데,
// 길게 눌러 모달이 열리면 오버레이가 행을 덮어서 그 click이 아예 오지 않는다. 그러면 삼킬
// 플래그가 남아 다음 번 누름을 먹는다. pointerup에서 끝내면 판정이 한 번의 누름 안에서 닫힌다.
// 대신 키보드는 button의 기본 click을 못 쓰므로 onKeyDown으로 직접 받는다.
export function useLongPress({ onLongPress, onPress }: UseLongPressOptions) {
  const timerRef = useRef<number | null>(null);
  // 누르기 시작한 좌표. cancel되면 null — "이번 누름은 무효"라는 표시를 겸한다.
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);
  const [pressing, setPressing] = useState(false);

  const cancel = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startRef.current = null;
    setPressing(false);
  };

  // 누르는 도중 언마운트되면 타이머가 남는다.
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  return {
    /** 누르고 있는 중인지 — 시각 피드백용 */
    pressing,
    handlers: {
      onPointerDown: (e: React.PointerEvent) => {
        // 우클릭은 수정으로 가는 별도 경로라 여기서 잡지 않는다.
        if (e.button !== 0) return;
        firedRef.current = false;
        startRef.current = { x: e.clientX, y: e.clientY };
        setPressing(true);
        timerRef.current = window.setTimeout(() => {
          firedRef.current = true;
          cancel();
          onLongPress();
        }, DELAY_MS);
      },
      onPointerMove: (e: React.PointerEvent) => {
        const start = startRef.current;
        if (!start) return;
        const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
        if (moved > MOVE_TOLERANCE_PX) cancel();
      },
      onPointerUp: () => {
        // startRef가 비었으면 이미 취소된 누름이다(움직였거나 길게 눌러 발동했거나).
        const valid = startRef.current !== null && !firedRef.current;
        cancel();
        if (valid) onPress();
      },
      // 터치 스크롤이 시작되면 브라우저가 pointercancel을 준다 — 그때도 판정을 접는다.
      onPointerCancel: cancel,
      onPointerLeave: cancel,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        // Space는 기본이 페이지 스크롤이고, 둘 다 button의 기본 click을 부른다.
        e.preventDefault();
        onPress();
      },
    },
  };
}
