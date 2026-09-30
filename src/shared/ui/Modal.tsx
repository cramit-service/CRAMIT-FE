// src/shared/ui/Modal.tsx
'use client';

import { useEffect, useRef } from 'react';

// 포커스를 받을 수 있는 요소들. Tab을 패널 안에 가두려면 첫/마지막을 알아야 한다.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// 화면은 이걸 직접 부르지 않는다 (§4) — FormModal과 ConfirmModal 둘이 전부다.
// 여기 남는 건 생김새가 아니라 장치다: 포커스 가두기, Escape, 스크롤 잠금, 딤.
// 폭(655)과 안쪽 여백은 두 모달이 각자 갖는다.
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** 제목 요소의 id. 스크린리더가 이 모달을 무엇이라 읽을지 결정한다. */
  labelledBy?: string;
}

export function Modal({ open, onClose, children, labelledBy }: ModalProps) {
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
      className="bg-dim z-modal fixed inset-0 flex items-center justify-center"
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
        // 높이는 내용의 것이되 창의 80%를 넘지 않는다 (§4). 넘으면 모달이 자기 안에서 구른다.
        // 구르는 자리는 안에 든 모달이 정한다 — 제목과 푸터는 제자리에 있어야 하므로
        // 여기서 통째로 overflow를 걸면 셋이 같이 밀려 올라간다.
        className="shadow-far bg-surface flex max-h-[80vh] w-[655px] flex-col overflow-hidden rounded-md"
      >
        {children}
      </div>
    </div>
  );
}
