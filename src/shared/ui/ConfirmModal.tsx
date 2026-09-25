'use client';
// src/shared/ui/ConfirmModal.tsx
// DESIGN.md §4 "There are two modals, and neither has a close button" /
// "A question is asked at the page's own size".
import { useId } from 'react';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';

interface ConfirmModalProps {
  open: boolean;
  /** 물음 자체가 제목이다. 따로 숨긴 제목을 두지 않는다. */
  question: string;
  /** 물음만으로 부족할 때 한 줄. 없으면 안 그린다. */
  detail?: string;
  /** 확정 쪽 버튼의 말. 되돌릴 수 없으면 rank를 danger로 준다. */
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  open,
  question,
  detail,
  confirmLabel,
  danger = false,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const questionId = useId();

  return (
    <Modal open={open} onClose={onClose} labelledBy={questionId}>
      <div className="min-h-0 overflow-y-auto p-12">
        {/* 물음은 자기 패널 안에서 가장 큰 것이면 된다. 화면에서 가장 클 필요는 없다 —
            딤과 그림자가 이미 "위에 있다"고 말하고 있어서, 뒤 페이지의 제목보다
            큰 글자는 같은 말을 두 번 하는 것이다. */}
        <h2
          id={questionId}
          className="text-heading-sm font-semibold text-gray-800"
        >
          {question}
        </h2>

        {detail && <p className="text-body-sm mt-3 text-gray-500">{detail}</p>}

        {/* ×가 없다. 푸터가 늘 취소를 들고 있어서, 닫기 버튼은 사람이 가장 늦게
            찾는 구석에 놓인 두 번째 출구가 된다. Escape와 딤은 그대로 닫는다. */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <Button rank="secondary" disabled={busy} onClick={onClose}>
            취소
          </Button>
          <Button
            rank={danger ? 'danger' : 'primary'}
            disabled={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
