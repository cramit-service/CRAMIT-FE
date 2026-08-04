// src/shared/ui/Modal.tsx
'use client';

import { useEffect } from 'react';
import { cn } from '@/shared/lib/cn';

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
  // ESC 키로 닫기 + 열려 있을 때 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(surfaceStyles[surface], className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
