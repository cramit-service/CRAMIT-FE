'use client';
// src/features/project/components/NewChapterScreen.tsx
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiRequestError, UPLOAD_ABORTED } from '@/shared/lib/apiClient';
import { toLocalDateString } from '@/shared/lib/date';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { useProjectDetail } from '@/features/study/hooks/useProjectDetail';
import { useChapters } from '@/features/study/hooks/useChapters';
import { useCreateChapter } from '@/features/project/hooks/useCreateChapter';
import { ChevronLeftIcon } from '@/features/study/components/icons';
import { Tag } from '@/features/study/components/Tag';
import { ViewerTabs } from '@/features/study/components/viewer/ViewerTabs';
import { formatChapterDay } from '@/features/study/lib/format';
import { FileDropzone } from './FileDropzone';
import { RecordingSlot } from './RecordingSlot';
import { ChapterUploadOverlay } from './ChapterUploadOverlay';

// 로딩·에러 문구도 본문과 같은 폭에 둔다 — 데이터가 도착하는 순간 콘텐츠가 가로로 튀지 않게.
const PAGE_SHELL = 'mx-auto w-full px-6 pt-10 pb-8 lg:content-col lg:px-0';

interface NewChapterScreenProps {
  projectId: string;
}

// 새 주차 등록 화면. 모달을 띄우는 대신 학습 화면 자리로 바로 들어와서, 여기서 자료를 올린다.
// 수업을 들으면서 쓰는 동선이라 모달에 갇히지 않는 게 중요하다(#107).
//
// 제목·수강 날짜·교수명은 묻지 않는다 — 제목은 비워 두고(뷰어 헤더에서 눌러 붙인다),
// 날짜는 오늘, 교수명은 강의에 적힌 값을 그대로 쓴다.
export function NewChapterScreen({ projectId }: NewChapterScreenProps) {
  const router = useRouter();
  const projectQuery = useProjectDetail(projectId);
  const chaptersQuery = useChapters(projectId);
  const createChapter = useCreateChapter();

  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // 업로드 도중 이 화면이 사라지면 요청만 남아 계속 돈다. 진행률도 취소도 없는
  // 업로드가 되므로 사라질 때 같이 끊는다.
  useEffect(() => () => abortRef.current?.abort(), []);

  const chapters = chaptersQuery.data ?? [];
  // 번호는 서버가 매기지만 화면에는 미리 보여줘야 해서 같은 규칙으로 짐작한다.
  const nextNumber =
    chapters.reduce((max, c) => Math.max(max, c.chapterNumber), 0) + 1;

  const isPending = createChapter.isPending;
  const canSubmit =
    (materialFile !== null || audioFile !== null) &&
    !materialError &&
    !audioError &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setFormError(null);
    setProgress(0);

    const controller = new AbortController();
    abortRef.current = controller;

    createChapter.mutate(
      {
        projectId,
        title: '',
        lectureDate: toLocalDateString(new Date()),
        professor: projectQuery.data?.professor ?? null,
        materialFile,
        audioFile,
        onProgress: setProgress,
        signal: controller.signal,
      },
      {
        // 만들자마자 그 주차의 학습 화면으로 넘어간다. replace라 뒤로가기가
        // 빈 등록 화면으로 돌아오지 않는다.
        onSuccess: (chapter) =>
          router.replace(
            `/projects/${projectId}/chapters/${chapter.chapterId}`,
          ),
        onError: (error: Error) => {
          // 사용자가 직접 멈춘 건 실패가 아니다. 문구 없이 폼으로 돌아가기만 한다.
          if (
            error instanceof ApiRequestError &&
            error.code === UPLOAD_ABORTED
          ) {
            return;
          }
          setFormError(error.message);
        },
      },
    );
  };

  if (projectQuery.isPending || chaptersQuery.isPending) {
    return <div className={`${PAGE_SHELL} text-gray-500`}>불러오는 중…</div>;
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <div className={`${PAGE_SHELL} text-gray-500`}>
        강의를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn(PAGE_SHELL, 'block')}>
      {/* 학습 뷰어와 같은 2단 헤더다 — 자료가 들어오면 이 화면이 그대로 뷰어가 된다.
          탭은 아직 열 게 없어 잠가 두지만, 무엇이 생길지는 미리 보여준다. */}
      <header>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push(`/projects/${projectId}`)}
            className="inline-flex shrink-0 items-center gap-1.5 text-gray-950 transition-colors hover:text-gray-700"
          >
            <ChevronLeftIcon className="size-5" />
            <span className="text-label font-medium">이전으로</span>
          </button>
          <h1 className="text-heading-sm min-w-0 truncate text-right font-semibold text-gray-950">
            Chapter {nextNumber}
          </h1>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <ViewerTabs activeTabs={[]} onToggle={() => {}} locked />
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-label text-gray-950">
              {projectQuery.data.title}
            </p>
            {projectQuery.data.professor && (
              <Tag tone="dark">{projectQuery.data.professor} 교수님</Tag>
            )}
            <Tag tone="outline">
              {formatChapterDay(new Date().toISOString())}
            </Tag>
          </div>
        </div>
      </header>

      {/* 학습 화면과 같은 어두운 패널이다 — 자료가 들어오면 이 자리가 그대로 뷰어가 된다. */}
      <section className="mt-5 flex min-h-[590px] flex-col items-center justify-center gap-9 rounded-md bg-gray-900 px-8 py-10">
        <div className="text-center">
          <p className="text-heading-sm font-semibold text-white">
            Chapter {nextNumber} 학습을 시작해요
          </p>
          <p className="text-body-sm mt-3 text-gray-400">
            강의 자료와 녹음이 모이면 AI가 요약과 원문 스크립트를 만들어 줍니다.
          </p>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-6">
          <FileDropzone
            kind="material"
            label="강의 자료 업로드"
            file={materialFile}
            onChange={setMaterialFile}
            error={materialError}
            onError={setMaterialError}
            disabled={isPending}
          />
          <FileDropzone
            kind="audio"
            label="녹음 파일 업로드"
            file={audioFile}
            onChange={setAudioFile}
            error={audioError}
            onError={setAudioError}
            disabled={isPending}
          />
          <RecordingSlot />
        </div>

        {/* STT가 PDF에서 전공 용어를 먼저 뽑고 그걸로 음성을 푼다.
            자료 없이도 돌아가지만 정확도가 떨어지므로 올리기 전에 알려 준다. */}
        <div className="text-label space-y-1 text-center text-gray-500">
          <p>
            강의 자료를 함께 올리면 전공 용어를 먼저 뽑아{' '}
            <span className="text-gray-300">원문 스크립트가 정확해집니다.</span>
          </p>
          <p>
            강의 자료만 먼저 올려 두고, 수업 시간에 다시 들어와 붙여도 됩니다.
          </p>
        </div>

        {formError && <p className="text-label text-error">{formError}</p>}

        <Button type="submit" size="lg" disabled={!canSubmit}>
          업로드하기
        </Button>
      </section>

      {isPending && (
        <ChapterUploadOverlay
          message="새로운 주차를 업로드 중입니다..."
          progress={progress}
          onCancel={() => abortRef.current?.abort()}
        />
      )}
    </form>
  );
}
