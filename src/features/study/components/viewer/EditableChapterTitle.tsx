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

  const start = () => {
    setDraft(chapter.title);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next === chapter.title) return;
    updateChapter.mutate({
      chapterId: chapter.chapterId,
      projectId: chapter.projectId,
      title: next,
      lectureDate: chapter.lectureDate,
      professor: chapter.professor,
      // 제목만 고친다 — 파일은 건드리지 않으므로 null이면 기존 파일이 유지된다
      materialFile: null,
      audioFile: null,
    });
  };

  return (
    <h1 className="text-heading-sm flex min-w-0 items-center justify-end gap-2 font-semibold text-gray-950">
      <span className="shrink-0">Chapter {chapter.chapterNumber}</span>
      {(chapter.title !== '' || editing) && (
        <span className="shrink-0 text-gray-500">-</span>
      )}
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            // 뷰어는 Esc·방향키를 화면 단축키로 쓴다. 글자를 치는 동안은 넘기지 않는다.
            e.stopPropagation();
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setDraft(chapter.title);
              setEditing(false);
            }
          }}
          aria-label="주차 제목"
          className="focus-visible:border-secondary-400 min-w-0 flex-1 border-b border-gray-500 bg-transparent text-right outline-none"
        />
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
