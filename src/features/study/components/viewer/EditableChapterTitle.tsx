'use client';
// src/features/study/components/viewer/EditableChapterTitle.tsx
import { useUpdateChapter } from '@/features/project/hooks/useUpdateChapter';
import { EditableText } from '@/shared/ui/EditableText';
import type { Chapter } from '@/shared/types/api';

// 뷰어 헤더의 "Chapter N - 제목". 제목을 눌러 그 자리에서 고친다.
// 새 주차는 제목 없이 만들어지므로(등록 화면이 묻지 않는다) 여기가 이름을 붙이는 자리다.
// 고치는 동작 자체는 shared/ui/EditableText가 갖고, 여기 남는 것은 무엇을 저장하느냐다.
export function EditableChapterTitle({ chapter }: { chapter: Chapter }) {
  const updateChapter = useUpdateChapter(chapter.projectId);

  return (
    <h1 className="text-heading-sm relative flex min-w-0 items-center gap-2 font-semibold text-gray-800">
      <span className="shrink-0">Chapter {chapter.chapterNumber}</span>
      {chapter.title !== '' && (
        <span className="shrink-0 text-gray-500">-</span>
      )}
      <EditableText
        value={chapter.title}
        placeholder="제목 추가"
        label="주차 제목"
        saving={updateChapter.isPending}
        error={
          updateChapter.isError
            ? '제목을 저장하지 못했어요. 다시 시도해 주세요.'
            : undefined
        }
        onCancel={() => updateChapter.reset()}
        onCommit={(title) =>
          updateChapter.mutate({
            chapterId: chapter.chapterId,
            projectId: chapter.projectId,
            title,
            lectureDate: chapter.lectureDate,
            professor: chapter.professor,
            // 제목만 고친다 — 파일은 건드리지 않으므로 null이면 기존 파일이 유지된다
            materialFile: null,
            audioFile: null,
          })
        }
      />
    </h1>
  );
}
