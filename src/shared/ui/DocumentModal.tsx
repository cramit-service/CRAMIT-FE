'use client';
// src/shared/ui/DocumentModal.tsx
// DESIGN.md §4 "There are three modals, and none has a ×" /
// "A text to read is not a form and not a question".
import { useId } from 'react';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { ScrollArea } from '@/shared/ui/ScrollArea';

interface DocumentModalProps {
  open: boolean;
  /** 글의 제목. 그린다. */
  title: string;
  /** 읽을 글. 줄바꿈은 그대로 살린다. */
  children: React.ReactNode;
  /** 이 글이 묻는 동작 하나 — 약관이면 동의하기. 없으면 닫기만 선다. */
  action?: { label: string; onClick: () => void };
  onClose: () => void;
}

export function DocumentModal({
  open,
  title,
  children,
  action,
  onClose,
}: DocumentModalProps) {
  const titleId = useId();

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      {/* 여백은 FormModal과 같다 */}
      <h2
        id={titleId}
        className="text-heading-sm shrink-0 px-12 pt-12 pb-8 font-semibold text-gray-800"
      >
        {title}
      </h2>

      <ScrollArea label={`${title} 본문`}>
        <div className="text-body-sm px-12 wrap-break-word whitespace-pre-line text-gray-700">
          {children}
        </div>
      </ScrollArea>

      <div className="flex shrink-0 items-center justify-end gap-3 px-12 pt-8 pb-12">
        <Button rank="secondary" onClick={onClose}>
          닫기
        </Button>
        {action && <Button onClick={action.onClick}>{action.label}</Button>}
      </div>
    </Modal>
  );
}
