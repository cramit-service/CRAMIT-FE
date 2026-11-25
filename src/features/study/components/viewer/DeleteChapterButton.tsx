'use client';
// src/features/study/components/viewer/DeleteChapterButton.tsx
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDeleteChapter } from '@/features/project/hooks/useDeleteChapter';
import type { Chapter } from '@/shared/types/api';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { IconButton } from '@/shared/ui/IconButton';

// 뷰어 헤더의 주차 삭제. 지우고 나면 그 강의의 주차 목록으로 돌아간다.
export function DeleteChapterButton({ chapter }: { chapter: Chapter }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const deleteChapter = useDeleteChapter(chapter.projectId);
  // 성공 뒤 목록으로 넘어가는 동안에도 잠가 둔다. 풀리면 지운 주차의 모달이 다시 눌린다.
  const busy = deleteChapter.isPending || deleteChapter.isSuccess;

  return (
    <>
      <span className="shrink-0">
        <IconButton
          name="delete"
          glyph={16}
          aria-label="주차 삭제"
          onClick={() => {
            deleteChapter.reset();
            setConfirming(true);
          }}
        />
      </span>

      <ConfirmModal
        open={confirming}
        question="이 주차를 삭제할까요?"
        detail="학습 기록과 연결된 TODO가 함께 지워지고 되돌릴 수 없어요."
        confirmLabel={busy ? '삭제 중…' : '삭제하기'}
        danger
        busy={busy}
        onConfirm={() =>
          deleteChapter.mutate(chapter.chapterId, {
            onSuccess: () => router.replace(`/projects/${chapter.projectId}`),
            onError: () => setConfirming(false),
          })
        }
        onClose={() => {
          if (!busy) setConfirming(false);
        }}
      />

      {deleteChapter.isError && (
        <p
          role="alert"
          className="text-label text-red-ink absolute top-full right-0 mt-1 font-normal"
        >
          주차를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </>
  );
}
