'use client';
// src/features/study/hooks/useLongPress.ts
import { useCallback, useRef } from 'react';

// 꾹 누르는 시간. 이보다 짧으면 그냥 클릭이다.
const LONG_PRESS_MS = 500;
// 이만큼 넘게 움직이면 누른 게 아니라 스크롤·드래그로 본다.
const MOVE_TOLERANCE = 10;

// "꾹 눌러서 수정" 제스처. 반환값을 그대로 엘리먼트에 펼쳐 쓴다.
// 마우스 우클릭(과 키보드의 메뉴 키)도 같은 동작에 연결한다 — 길게 누르기는
// 키보드로 흉내낼 수 없어서, 이게 없으면 키보드만 쓰는 사용자는 수정에 못 들어간다.
export function useLongPress(onLongPress: () => void, enabled = true) {
  const timerRef = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  // 길게 눌러 열렸으면 손을 뗄 때 따라오는 click을 삼켜야 한다
  // (예: "학습하기" 위에서 꾹 누르면 수정 모달과 화면 이동이 같이 일어난다).
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    originRef.current = null;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      // 마우스는 왼쪽 버튼만 (오른쪽은 아래 onContextMenu가 받는다)
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      firedRef.current = false;
      originRef.current = { x: e.clientX, y: e.clientY };
      timerRef.current = window.setTimeout(() => {
        firedRef.current = true;
        timerRef.current = null;
        onLongPress();
      }, LONG_PRESS_MS);
    },
    [enabled, onLongPress],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const origin = originRef.current;
      if (!origin) return;
      if (
        Math.abs(e.clientX - origin.x) > MOVE_TOLERANCE ||
        Math.abs(e.clientY - origin.y) > MOVE_TOLERANCE
      ) {
        clear();
      }
    },
    [clear],
  );

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (!firedRef.current) return;
    firedRef.current = false;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;
      // 터치에서 길게 누르면 브라우저 기본 메뉴가 뜨는데, 그게 뜨면 우리 모달이 가린다.
      e.preventDefault();
      clear();
      onLongPress();
    },
    [enabled, clear, onLongPress],
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onClickCapture,
    onContextMenu,
  };
}
