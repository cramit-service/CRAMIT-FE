'use client';
// src/features/study/components/viewer/AskAboutSelection.tsx
import { useEffect, useRef, useState } from 'react';
import { useAskAI } from '@/features/chat/components/ChatDockProvider';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

// 메뉴가 선택 위에 설 자리가 없으면 아래로 내린다. 메뉴 높이(sm 버튼 + 여백)보다 조금 크게 잡는다.
const ROOM_ABOVE = 56;
// 오른쪽 끝에서 고르면 메뉴가 패널 밖으로 나가지 않게 왼쪽으로 당긴다.
const MENU_WIDTH = 160;
const GAP = 8;

interface Menu {
  text: string;
  top: number;
  left: number;
  below: boolean;
}

// 요약·원문 스크립트에서 글을 고르면 그 위에 [AI에게 질문]을 띄운다 (프리뷰 보드 G).
// 챗독이 없는 화면(프로바이더 밖)에서는 아무것도 덧붙이지 않는다.
export function AskAboutSelection({ children }: { children: React.ReactNode }) {
  const ask = useAskAI();
  const rootRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<Menu | null>(null);

  // 선택이 풀리면(빈 곳 클릭, 다른 데서 선택) 메뉴도 닫는다.
  useEffect(() => {
    const onChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) setMenu(null);
    };
    document.addEventListener('selectionchange', onChange);
    return () => document.removeEventListener('selectionchange', onChange);
  }, []);

  // 드래그가 끝난 뒤에만 띄운다. 끄는 동안 띄우면 메뉴가 커서를 따라 흔들린다.
  const readSelection = () => {
    const root = rootRef.current;
    const selection = window.getSelection();
    if (!root || !selection || selection.isCollapsed || !selection.rangeCount) {
      return setMenu(null);
    }
    const range = selection.getRangeAt(0);
    const text = selection.toString().trim();
    if (!text || !root.contains(range.commonAncestorContainer)) {
      return setMenu(null);
    }
    const rect = range.getBoundingClientRect();
    const box = root.getBoundingClientRect();
    const below = rect.top - box.top < ROOM_ABOVE;
    setMenu({
      text,
      top: below ? rect.bottom - box.top + GAP : rect.top - box.top - GAP,
      left: Math.max(0, Math.min(rect.left - box.left, box.width - MENU_WIDTH)),
      below,
    });
  };

  if (!ask) return <>{children}</>;

  return (
    // relative 필수 — 메뉴가 absolute다 (CLAUDE.md 4-6).
    <div
      ref={rootRef}
      className="relative"
      onMouseUp={readSelection}
      onKeyUp={readSelection}
      // 터치는 손을 뗀 뒤에 선택이 확정된다.
      onTouchEnd={() => setTimeout(readSelection, 0)}
    >
      {children}
      {menu && (
        <div
          role="toolbar"
          aria-label="고른 글"
          // 누르는 순간 선택이 풀리면 메뉴가 먼저 닫혀 클릭이 사라진다.
          onMouseDown={(e) => e.preventDefault()}
          style={{ top: menu.top, left: menu.left }}
          className={
            menu.below
              ? 'bg-surface shadow-far absolute z-10 rounded-md border border-gray-100 p-1'
              : 'bg-surface shadow-far absolute z-10 -translate-y-full rounded-md border border-gray-100 p-1'
          }
        >
          <Button
            rank="secondary"
            size="sm"
            onClick={() => {
              ask(menu.text);
              setMenu(null);
              window.getSelection()?.removeAllRanges();
            }}
          >
            <span className="text-sky-ink flex">
              <Icon name="sparkle" size={16} />
            </span>
            AI에게 질문
          </Button>
        </div>
      )}
    </div>
  );
}
