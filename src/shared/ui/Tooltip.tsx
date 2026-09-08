'use client';
// src/shared/ui/Tooltip.tsx
import { cloneElement, useCallback, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

// 트리거 오른쪽 경계에서 띄우는 간격
const GAP = 8;

interface TooltipProps {
  label: string;
  // 라벨이 이미 화면에 있는 상태(사이드바 펼침 등)에서는 끈다
  disabled?: boolean;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

// 트리거 오른쪽에 뜨는 툴팁.
// body로 포털을 보내는 이유는 사이드바 nav가 overflow-x-hidden이라 안에서 그리면 잘리기 때문이다.
// 위치는 fixed + 트리거 실측이라 스크롤 컨테이너 안에서도 어긋나지 않는다.
// (다른 방향이 필요해지면 여기서 늘린다 — 지금 쓰는 곳은 접힌 레일뿐이다.)
export function Tooltip({ label, disabled = false, children }: TooltipProps) {
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);
  const id = useId();

  // 트리거는 ref 대신 이벤트의 currentTarget으로 잡는다 — cloneElement로 ref를 넘기면
  // 렌더 중에 읽힐 수 있어 react-hooks/refs에 걸린다.
  const open = useCallback((el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setBox({ top: r.top + r.height / 2, left: r.right + GAP });
  }, []);

  const close = useCallback(() => setBox(null), []);

  // 트리거가 움직이면 자리가 어긋난다. 따라다니게 하는 대신 닫는다.
  // scroll은 버블링하지 않으므로 캡처 단계에서 듣는다.
  useEffect(() => {
    if (!box) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [box, close]);

  if (disabled) return children;

  const inner = children.props;
  const trigger = cloneElement(children, {
    'aria-describedby': box ? id : undefined,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      inner.onMouseEnter?.(e);
      open(e.currentTarget);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      inner.onMouseLeave?.(e);
      close();
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      inner.onFocus?.(e);
      open(e.currentTarget);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      inner.onBlur?.(e);
      close();
    },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <>
      {trigger}
      {box &&
        createPortal(
          <div
            id={id}
            role="tooltip"
            // 마우스를 가로채면 트리거에서 벗어난 것으로 읽혀 툴팁이 깜빡인다
            className="text-label z-tooltip pointer-events-none fixed -translate-y-1/2 rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1 whitespace-nowrap text-gray-100 shadow-lg"
            style={{ top: box.top, left: box.left }}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
}
