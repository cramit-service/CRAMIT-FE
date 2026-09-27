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

import { ViewerTabs } from '@/features/study/components/viewer/ViewerTabs';
import { VIEWER_PANEL } from '@/features/study/components/viewer/panel';
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

  // 목록 조회가 실패하면 chapters가 빈 배열이 되어 주차 번호를 1부터 다시 매긴다.
  // 이미 6주차까지 있는 강의에 Chapter 1을 또 만들게 되므로 오류로 다룬다.
  if (projectQuery.isError || chaptersQuery.isError || !projectQuery.data) {
    return (
      <div className={cn(PAGE_SHELL, 'flex flex-col items-start gap-4')}>
        <p className="text-gray-700">
          강의 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <Button
          rank="secondary"
          onClick={() => {
            void projectQuery.refetch();
            void chaptersQuery.refetch();
          }}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn(PAGE_SHELL, 'block')}>
      {/* 학습 뷰어와 같은 2단 헤더다 — 자료가 들어오면 이 화면이 그대로 뷰어가 된다.
          탭은 아직 열 게 없어 잠가 두지만, 무엇이 생길지는 미리 보여준다. */}
      <header>
        {/* 제목은 "Chapter N"이 아니라 강의명 + 몇 주차다 — 이 화면에 들어온 사람이
            알아야 하는 건 어느 강의의 몇 번째 자리인지고, 강의명은 오른쪽에서 따로
            말할 게 아니라 제목이 직접 말해야 한다(그래서 교수명·날짜 줄을 지웠다).
            숫자를 제목과 한 덩어리로 자르면 긴 강의명에서 "4주차"가 먼저 잘린다.
            강의명만 줄이고 숫자는 남긴다. */}
        <h1 className="text-heading-md flex min-w-0 items-baseline font-semibold text-gray-800">
          <span className="min-w-0 truncate">{projectQuery.data.title}</span>
          {/* 간격을 gap이 아니라 진짜 공백으로 둔다 — gap이면 보조기기가 두 span을
              붙여 "알고리즘7주차"로 읽는다. */}
          <span className="shrink-0"> {nextNumber}주차</span>
        </h1>

        <div className="mt-7">
          <ViewerTabs activeTabs={[]} onToggle={() => {}} locked />
        </div>
      </header>

      {/* 자료가 들어오면 이 자리가 그대로 뷰어가 되므로 판도 뷰어의 것을 그대로 쓴다.
          어두운 판(bg-gray-900)이었는데 §2에 어두운 표면이 없다 — 같은 상수를 부르면
          "그대로 뷰어가 된다"는 말이 주석이 아니라 코드가 된다. */}
      <section
        className={cn(
          VIEWER_PANEL,
          'flex flex-col items-center justify-center gap-9 px-8 py-10',
        )}
      >
        <div className="text-center">
          <p className="text-heading-sm font-semibold text-gray-800">
            {nextNumber}주차 학습을 시작해요
          </p>
          <p className="text-body-sm mt-3 text-gray-500">
            강의 자료와 녹음이 모이면 AI가 요약과 원문 스크립트를 만들어 줍니다.
          </p>
        </div>

        {/* 칸 셋의 폭은 판이 나눈다. 전에는 폭을 아무도 안 줘서 안내 문구 길이가
            각자 폭을 정했고(264·253·221), 파일을 고르면 파일명이 그 폭을 다시
            정했다 — 짧은 이름엔 182로 줄고 긴 이름엔 659로 벌어졌다.
            grid라 셋이 늘 같고, 폭이 정해지니 안에서 truncate가 비로소 동작한다. */}
        <div className="grid w-full grid-cols-3 items-start gap-6">
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
            <span className="text-gray-700">원문 스크립트가 정확해집니다.</span>
          </p>
          <p>
            강의 자료만 먼저 올려 두고, 수업 시간에 다시 들어와 붙여도 됩니다.
          </p>
        </div>

        {formError && <p className="text-label text-red-ink">{formError}</p>}

        <Button type="submit" disabled={!canSubmit}>
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
