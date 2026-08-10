// src/shared/ui/Modal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';

// 포커스를 받을 수 있는 요소들. Tab을 패널 안에 가두려면 첫/마지막을 알아야 한다.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// 패널 기본 스타일. cn()에는 tailwind-merge가 없어 className으로 배경·여백을 덮어쓰면
// 승자가 클래스 생성 순서에 달린다. 그래서 서로 겹치지 않는 '완성된' 세트를 prop으로 고른다.
// - card : 밝은 기본 카드 (확인/삭제 등 짧은 모달)
// - bare : 폭·배경·여백을 호출처가 전부 정한다 (시안이 따로 있는 큰 다크 모달)
type Surface = 'card' | 'bare';

const surfaceStyles: Record<Surface, string> = {
  card: 'w-full max-w-md rounded-lg bg-white p-6 shadow-xl',
  bare: '',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  surface?: Surface;
  /** 제목 요소의 id. 스크린리더가 이 모달을 무엇이라 읽을지 결정한다. */
  labelledBy?: string;
}

export function Modal({
  open,
  onClose,
  children,
  className,
  surface = 'card',
  labelledBy,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // onClose를 ref에 담아 아래 effect의 의존성에서 뺀다.
  // 호출처는 대개 렌더마다 새 함수를 넘기는데(인라인 화살표 등), 그걸 의존성으로 두면
  // 글자를 한 번 칠 때마다 effect가 다시 돌면서 panelRef.focus()가 포커스를 뺏어가
  // 입력이 한 글자에서 끊긴다. effect가 하는 일은 onClose와 무관하다.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // ESC 닫기 + 배경 스크롤 잠금 + 포커스 가두기.
  // aria-modal="true"는 보조기술에 "배경은 비활성"이라고 알리는 선언이라,
  // 실제로 Tab이 배경으로 새어 나가면 선언과 동작이 어긋난다. 여기서 맞춰준다.
  useEffect(() => {
    if (!open) return;

    // 열릴 때 포커스를 패널로 옮기고, 닫힐 때 열기 전 위치로 되돌린다.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable =
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      // 조작할 수 있는 요소가 하나도 없으면 Tab이 배경으로 나가지 않게 아예 막는다.
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // 어쩌다 포커스가 밖에 있으면 먼저 안으로 데려온다.
      if (!panelRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }

      // 열린 직후에는 패널 자신이 포커스를 갖는다. 이때의 Shift+Tab도 '처음'으로 봐야 한다.
      // 이 조건을 빼면 모달을 열자마자 Shift+Tab 한 번에 포커스가 배경으로 빠져나간다.
      const atStart = active === first || active === panelRef.current;
      // 끝에서 Tab, 처음에서 Shift+Tab이면 반대편으로 돌려보낸다.
      if (e.shiftKey && atStart) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      // click은 누른 곳과 뗀 곳의 공통 조상에서 발생한다. onClick으로 닫으면
      // 패널 안 글자를 드래그하다 배경에서 손을 떼는 순간 모달이 닫혀 입력이 날아간다.
      // 배경에서 눌러 배경에서 뗀 경우만 닫는다.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(surfaceStyles[surface], className)}
      >
        {children}
      </div>
    </div>
  );
}
