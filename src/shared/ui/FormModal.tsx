'use client';
// src/shared/ui/FormModal.tsx
// DESIGN.md §4 "There are two modals, and neither has a close button" /
// "A modal says out loud what it says to a reader" / "Both modals are 655 wide".
import { useId } from 'react';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { ScrollArea } from '@/shared/ui/ScrollArea';

interface FormModalProps {
  open: boolean;
  /** 제목은 그린다. 숨긴 제목은 읽는 사람이 하나뿐이라 낡아도 아무도 모른다. */
  title: string;
  /** 저장 쪽 버튼의 말 — 생성하기·수정완료 같은 것. */
  submitLabel: string;
  /** 편집 중일 때만. 푸터 반대쪽 끝에 선다. */
  onDelete?: () => void;
  deleteLabel?: string;
  submitDisabled?: boolean;
  busy?: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  children: React.ReactNode;
}

export function FormModal({
  open,
  title,
  submitLabel,
  onDelete,
  deleteLabel = '삭제하기',
  submitDisabled = false,
  busy = false,
  onSubmit,
  onClose,
  children,
}: FormModalProps) {
  const titleId = useId();

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} labelledBy={titleId}>
      {/* 안쪽 여백 48, 블록 사이 24, 푸터 위 32 — 전부 §2의 간격 목록에서 온다.
          제목과 푸터는 제자리에 서고 칸들만 구른다. 셋이 같이 구르면 칸이 많은 모달에서
          무엇을 채우는 중인지도, 어디서 끝내는지도 화면 밖으로 나간다. */}
      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <h2
          id={titleId}
          className="text-heading-sm shrink-0 px-12 pt-12 pb-8 font-semibold text-gray-800"
        >
          {title}
        </h2>

        {/* 구르는 자리. 여백은 스크롤 칸이 아니라 안쪽 내용이 갖는다 —
            막대가 그 여백 위에 서서 글자를 안 덮는다. */}
        <ScrollArea>
          <div className="flex flex-col gap-6 px-12">{children}</div>
        </ScrollArea>

        {/* 취소는 선택이 아니다. ×가 없으니, 반쯤 채운 폼을 두고 나갈 길이
            푸터에 없으면 사람이 누를 것이 화면에 남지 않는다.
            삭제는 반대쪽 끝에 선다 — 연두와 빨강이 나란히 서면 둘 다 그 줄을
            자기 것이라 주장하고, 그 사이를 벌리는 것이 순위를 매기는 방법이다. */}
        <div className="flex shrink-0 items-center justify-end gap-3 px-12 pt-8 pb-12">
          {onDelete && (
            <span className="mr-auto">
              <Button rank="danger" disabled={busy} onClick={onDelete}>
                {deleteLabel}
              </Button>
            </span>
          )}
          <Button rank="secondary" disabled={busy} onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" disabled={busy || submitDisabled}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
