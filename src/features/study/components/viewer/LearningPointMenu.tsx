'use client';
// src/features/study/components/viewer/LearningPointMenu.tsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

const GAP = 8;
// AskAboutSelection과 같은 폭 가정. 화면 오른쪽 끝에서 밖으로 나가지 않게 당긴다.
const MENU_WIDTH = 180;

// 학습포인트 하이라이트를 누르면 그 아래에 뜨는 메뉴.
// 해제는 이 메뉴에서만 한다 — 고르는 메뉴의 [학습포인트]가 해제까지 맡으면 누르기 전엔 알 수 없다.
export function LearningPointMenu({
  anchor,
  onAsk,
  onRemove,
  onClose,
}: {
  anchor: DOMRect;
  onAsk?: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    // 하이라이트가 움직이면 메뉴가 엉뚱한 자리에 남는다. 따라가지 않고 닫는다.
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      role="toolbar"
      aria-label="학습포인트"
      style={{
        top: anchor.bottom + GAP,
        left: Math.min(
          Math.max(GAP, anchor.left),
          window.innerWidth - MENU_WIDTH - GAP,
        ),
      }}
      className="bg-surface shadow-far z-float fixed flex flex-col gap-1 rounded-md border border-gray-100 p-1"
    >
      {onAsk && (
        <Button rank="secondary" size="sm" onClick={onAsk}>
          <span className="text-sky-ink flex">
            <Icon name="sparkle" size={16} />
          </span>
          AI에게 질문
        </Button>
      )}
      <Button rank="secondary" size="sm" onClick={onRemove}>
        <Icon name="minus" size={16} />
        학습포인트 해제
      </Button>
    </div>,
    document.body,
  );
}
