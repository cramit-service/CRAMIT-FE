'use client';
// src/features/study/components/viewer/AskAboutSelection.tsx
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAskAI } from '@/shared/hooks/useChatDock';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

// 메뉴가 선택 위에 설 자리가 없으면 아래로 내린다. 메뉴 높이(sm 버튼 + 여백)보다 조금 크게 잡는다.
const ROOM_ABOVE = 56;
// 화면 오른쪽 끝에서 고르면 메뉴가 밖으로 나가지 않게 왼쪽으로 당긴다.
const MENU_WIDTH = 160;
const GAP = 8;

interface Menu {
  top: number;
  left: number;
  below: boolean;
}

// root 안의 글을 고른 상태면 그 범위와 글.
function readSelection(root: HTMLElement | null) {
  const selection = window.getSelection();
  if (!root || !selection || selection.isCollapsed || !selection.rangeCount) {
    return null;
  }
  const range = selection.getRangeAt(0);
  const text = selection.toString().trim();
  if (!text || !root.contains(range.commonAncestorContainer)) return null;
  return { range, text };
}

// 요약·원문 스크립트에서 글을 고르면 그 위에 [AI에게 질문]을 띄운다 (프리뷰 보드 G).
// 위치는 fixed + 선택 영역 실측이라 스크롤 칸에 잘리지 않는다(Tooltip과 같은 방식).
// 챗독이 없는 화면(프로바이더 밖)에서는 아무것도 덧붙이지 않는다.
export function AskAboutSelection({ children }: { children: React.ReactNode }) {
  const ask = useAskAI();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  // 메뉴를 띄운 글. 터치로 메뉴를 누르는 순간 선택이 먼저 풀려도 이 글로 묻는다.
  const shownText = useRef<string | null>(null);
  // 메뉴를 누르는 중에는 선택이 풀려도 닫지 않는다.
  const pressing = useRef(false);

  useEffect(() => {
    if (!ask) return;
    const place = () => {
      const picked = readSelection(rootRef.current);
      shownText.current = picked?.text ?? null;
      if (!picked) return setMenu(null);
      const rect = picked.range.getBoundingClientRect();
      const below = rect.top < ROOM_ABOVE;
      setMenu({
        top: below ? rect.bottom + GAP : rect.top - GAP,
        left: Math.min(
          Math.max(GAP, rect.left),
          window.innerWidth - MENU_WIDTH - GAP,
        ),
        below,
      });
    };
    const close = () => {
      shownText.current = null;
      setMenu(null);
    };
    // 드래그는 영역 밖에서 끝날 수 있어 문서에서 듣는다. 손을 뗀 다음 틱에 선택이 확정된다.
    const onRelease = () =>
      setTimeout(() => {
        pressing.current = false;
        place();
      }, 0);
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else place();
    };
    // 다른 곳을 누르면 닫는다. 아코디언처럼 글이 밀려도 메뉴가 엉뚱한 곳에 남지 않는다.
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) close();
    };
    const onSelectionChange = () => {
      if (!pressing.current && window.getSelection()?.isCollapsed) close();
    };
    // 스크롤·창 크기가 바뀌면 선택을 따라간다. scroll은 버블링하지 않아 캡처로 듣는다.
    const onMove = () => {
      if (shownText.current) place();
    };

    document.addEventListener('mouseup', onRelease);
    document.addEventListener('touchend', onRelease);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('selectionchange', onSelectionChange);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('mouseup', onRelease);
      document.removeEventListener('touchend', onRelease);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('selectionchange', onSelectionChange);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [ask]);

  const askAboutSelection = () => {
    // 메뉴를 띄운 뒤 터치 손잡이로 범위를 늘렸을 수 있다. 지금 선택이 있으면 그걸 쓴다.
    const text = readSelection(rootRef.current)?.text ?? shownText.current;
    pressing.current = false;
    shownText.current = null;
    setMenu(null);
    window.getSelection()?.removeAllRanges();
    if (text && ask) ask(text);
  };

  return (
    <div ref={rootRef}>
      {children}
      {menu &&
        createPortal(
          <div
            ref={menuRef}
            role="toolbar"
            aria-label="고른 글"
            // 누르는 순간 선택이 풀리면 메뉴가 먼저 닫혀 클릭이 사라진다.
            onMouseDown={(e) => e.preventDefault()}
            onPointerDown={() => (pressing.current = true)}
            style={{ top: menu.top, left: menu.left }}
            className={cn(
              'bg-surface shadow-far z-float fixed rounded-md border border-gray-100 p-1',
              !menu.below && '-translate-y-full',
            )}
          >
            <Button rank="secondary" size="sm" onClick={askAboutSelection}>
              <span className="text-sky-ink flex">
                <Icon name="sparkle" size={16} />
              </span>
              AI에게 질문
            </Button>
          </div>,
          document.body,
        )}
    </div>
  );
}
