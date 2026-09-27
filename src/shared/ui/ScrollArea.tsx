'use client';
// src/shared/ui/ScrollArea.tsx
// 안쪽 스크롤 영역(카드·패널·모달·사이드바)이 공유하는 한 모양.
// 네이티브 막대를 레이아웃에서 빼고, 아래를 페이드로 닫고, 막대는 직접 그린다.
//
// 네이티브를 숨겼다 띄우는 걸로는 안 된다 — Blink에서 클래식 스크롤바는 켜지는 순간
// 6px을 레이아웃에서 가져가므로 스크롤할 때마다 내용이 밀린다. 사이드바에서는 그 6px이
// 곧 연두 필의 좌우 비대칭이었다(좌 8 / 우 14). 그래서 네이티브는 완전히 빼고 얹는다.
//
// 여백은 이 부품이 아니라 안쪽 내용이 갖는다. 막대가 여백 위에 서야 글자를 안 덮는다.
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';

// 스크롤이 멈추고 막대가 사라지기까지. 짧으면 한 번 굴릴 때마다 깜빡인다.
const LINGER_MS = 700;
// 내용이 아주 길어도 집어서 끌 수 있을 만한 최소 길이
const MIN_THUMB = 24;

interface ScrollAreaProps {
  children: React.ReactNode;
  /** 아래 페이드를 아예 끈다. 켜 두면 "아래에 더 있을 때만" 뜬다. */
  fade?: boolean;
  /** 스크롤하는 노드. 코드가 직접 굴려야 하는 화면이 있다(챗의 맨 아래, 요약의 맨 위로). */
  ref?: React.Ref<HTMLDivElement>;
}

export function ScrollArea({
  children,
  fade = true,
  ref: forwarded,
}: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  // 끄는 동안의 시작점. 포인터 이동량을 스크롤 거리로 환산하는 기준이다.
  const drag = useRef<{ y: number; top: number } | null>(null);
  const [thumb, setThumb] = useState<{ top: number; height: number } | null>(
    null,
  );
  const [active, setActive] = useState(false);
  // 페이드는 "아래에 더 있다"는 말이다. 넘치지 않거나 바닥까지 내렸으면 할 말이 없다.
  const [more, setMore] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    // 넘치지 않으면 막대 자체가 없다
    if (scrollHeight <= clientHeight + 1) {
      setThumb(null);
      setMore(false);
      return;
    }
    setMore(scrollTop + clientHeight < scrollHeight - 1);
    const height = Math.max(
      MIN_THUMB,
      (clientHeight / scrollHeight) * clientHeight,
    );
    const top =
      (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - height);
    setThumb({ top, height });
  }, []);

  // 막대는 스크롤하는 동안 뜨고, 멈추면 LINGER_MS 뒤에 사라진다.
  // 끄는 중에는 타이머를 걸지 않는다 — 손으로 잡고 있는 막대가 사라지면 안 된다.
  const show = useCallback((linger: boolean) => {
    setActive(true);
    if (timer.current) clearTimeout(timer.current);
    if (linger) timer.current = setTimeout(() => setActive(false), LINGER_MS);
  }, []);

  const handleScroll = useCallback(() => {
    measure();
    show(!drag.current);
  }, [measure, show]);

  const handleThumbDown = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    // 막대를 눌렀을 때 아래 내용이 같이 눌리거나 글자가 선택되지 않게 한다.
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, top: el.scrollTop };
    show(false);
  };

  const handleThumbMove = (e: React.PointerEvent) => {
    const el = ref.current;
    const start = drag.current;
    if (!el || !start || !thumb) return;
    // 막대가 움직일 수 있는 거리(트랙 길이 − 막대 길이)를 내용이 움직일 수 있는
    // 거리로 환산한다. 둘의 비가 곧 끄는 속도다.
    const travel = el.clientHeight - thumb.height;
    if (travel <= 0) return;
    const ratio = (el.scrollHeight - el.clientHeight) / travel;
    el.scrollTop = start.top + (e.clientY - start.y) * ratio;
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    show(true);
  };

  // 창 크기·목록 길이가 바뀌면 막대 길이도 바뀐다. 보이지 않는 동안에도 재어 둬야
  // 다음에 뜰 때 옛 길이로 한 프레임 깜빡이지 않는다.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of el.children) ro.observe(child);
    return () => ro.disconnect();
  }, [measure, children]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      // 막대를 잡으려면 먼저 보여야 한다. 스크롤할 때만 뜨면 잡을 틈이 없다.
      onPointerEnter={() => thumb && show(false)}
      onPointerLeave={() => !drag.current && show(true)}
    >
      <div
        ref={(node) => {
          ref.current = node;
          if (typeof forwarded === 'function') forwarded(node);
          else if (forwarded) forwarded.current = node;
        }}
        onScroll={handleScroll}
        className={cn(
          'scrollbar-hidden min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain',
          fade && more && 'fade-bottom',
        )}
      >
        {children}
      </div>
      {thumb && (
        <span
          onPointerDown={handleThumbDown}
          onPointerMove={handleThumbMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ top: thumb.top, height: thumb.height }}
          // 잡는 폭은 12, 보이는 폭은 6이다. 4px 막대는 끌기에 너무 얇고,
          // 12를 다 칠하면 글자 위에 굵은 띠가 선다. 안 보일 때는 포인터를
          // 아예 안 받는다 — opacity-0은 클릭을 그대로 먹는다.
          className={cn(
            'absolute right-0 flex w-3 cursor-grab justify-end pr-1 transition-opacity duration-200 ease-out active:cursor-grabbing',
            active ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <span aria-hidden className="w-1.5 rounded-full bg-gray-300" />
        </span>
      )}
    </div>
  );
}
