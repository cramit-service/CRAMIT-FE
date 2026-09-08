'use client';
// src/features/study/components/viewer/EditableChapterTitle.tsx
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { useUpdateChapter } from '@/features/project/hooks/useUpdateChapter';
import type { Chapter } from '@/shared/types/api';

// 뷰어 헤더의 "Chapter N - 제목". 제목을 눌러 그 자리에서 고친다.
// 새 주차는 제목 없이 만들어지므로(등록 화면이 묻지 않는다) 여기가 이름을 붙이는 자리다.
export function EditableChapterTitle({ chapter }: { chapter: Chapter }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(chapter.title);
  const updateChapter = useUpdateChapter(chapter.projectId);
  const saving = updateChapter.isPending;
  const failed = updateChapter.isError;

  const start = () => {
    updateChapter.reset();
    setDraft(chapter.title);
    setEditing(true);
  };

  // 저장이 끝나야 편집을 닫는다. 먼저 닫으면 실패했을 때 방금 친 글자가 사라지고
  // 예전 제목이 아무 말 없이 돌아온다.
  const commit = () => {
    if (saving) return;
    const next = draft.trim();
    if (next === chapter.title) {
      setEditing(false);
      return;
    }
    updateChapter.mutate(
      {
        chapterId: chapter.chapterId,
        projectId: chapter.projectId,
        title: next,
        lectureDate: chapter.lectureDate,
        professor: chapter.professor,
        // 제목만 고친다 — 파일은 건드리지 않으므로 null이면 기존 파일이 유지된다
        materialFile: null,
        audioFile: null,
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <h1 className="text-heading-sm relative flex min-w-0 items-center justify-end gap-2 font-semibold text-gray-950">
      <span className="shrink-0">Chapter {chapter.chapterNumber}</span>
      {(chapter.title !== '' || editing) && (
        <span className="shrink-0 text-gray-500">-</span>
      )}
      {editing ? (
        <>
          <input
            autoFocus
            value={draft}
            disabled={saving}
            aria-invalid={failed || undefined}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onFocus={(e) => e.currentTarget.select()}
            onKeyDown={(e) => {
              // 뷰어는 Esc·방향키를 화면 단축키로 쓴다. 글자를 치는 동안은 넘기지 않는다.
              e.stopPropagation();
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') {
                updateChapter.reset();
                setDraft(chapter.title);
                setEditing(false);
              }
            }}
            aria-label="주차 제목"
            className={cn(
              'focus-visible:border-secondary-400 min-w-0 flex-1 border-b bg-transparent text-right outline-none',
              failed ? 'border-error' : 'border-gray-500',
              saving && 'text-gray-500',
            )}
          />
          {/* 헤더 줄을 밀어내지 않도록 아래에 띄운다 */}
          {failed && (
            <p
              role="alert"
              className="text-label text-error absolute top-full right-0 mt-1 font-normal"
            >
              제목을 저장하지 못했어요. 다시 시도해 주세요.
            </p>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={start}
          title="제목 수정"
          className={cn(
            'focus-visible:ring-secondary-400 min-w-0 truncate rounded-sm border-b border-transparent text-right transition-colors',
            'hover:border-gray-500 focus-visible:ring-2 focus-visible:outline-none',
            // 아직 이름이 없으면 눌러야 할 자리라는 걸 드러낸다
            chapter.title === '' && 'font-normal text-gray-500',
          )}
        >
          {chapter.title === '' ? '제목 추가' : chapter.title}
        </button>
      )}
    </h1>
  );
}
