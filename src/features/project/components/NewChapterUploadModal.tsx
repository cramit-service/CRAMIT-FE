'use client';
// src/features/project/components/NewChapterUploadModal.tsx
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { ApiRequestError, UPLOAD_ABORTED } from '@/shared/lib/apiClient';
import { Modal } from '@/shared/ui/Modal';
import {
  FIELD_FILLED,
  FIELD_OUTLINED,
  FIELD_WIDTH,
  HINT,
  LABEL,
  SECTION_DIVIDER,
} from '@/shared/ui/FormModal';
import { ModalDateField } from '@/shared/ui/ModalDateField';
// 강의 목록은 학습하기 화면(study)이 이미 조회한다. 같은 GET /projects를 두 번 정의하지 않고
// 그 훅을 그대로 쓴다 — 쿼리 키도 공유돼 캐시가 한 벌로 유지된다.
import { useProjectSummaries } from '@/features/study/hooks/useProjectSummaries';
import { FileDropzone } from './FileDropzone';
import { ChapterUploadOverlay } from './ChapterUploadOverlay';
import { ChevronDownIcon, CloseIcon, CloudUploadIcon } from './icons';
import { useCreateChapter } from '@/features/project/hooks/useCreateChapter';
import { useUpdateChapter } from '@/features/project/hooks/useUpdateChapter';
import type { Chapter } from '@/shared/types/api';

interface NewChapterUploadModalProps {
  /** 지금 보고 있는 강의(프로젝트). "강의" 셀렉트의 기본값이 된다. */
  projectId: string;
  projectTitle: string;
  /** 있으면 수정 모드(주차 카드를 꾹 눌러서 진입), 없으면 새 주차 업로드. */
  chapter?: Chapter;
  onClose: () => void;
}

// 입력 칸·라벨·구분선 스타일은 같은 시안 계열의 다른 다크 모달들과 공유한다.
// (시험 일정·TODO·강의 생성·공유하기 — 정의는 shared/ui/FormModal.tsx)

// 주차 업로드·수정 모달. 제목·강의·수강 날짜·교수명을 받고 강의자료(PDF)와 녹음을 올린다.
// 시안: 생성 `새 주차 업로드`(1:3560) / 수정 `주차 정보 수정하기`(528:8664).
// 두 시안은 제목 문구만 다르고 폼과 확정 버튼("업로드하기")이 같아 한 컴포넌트로 쓴다.
export function NewChapterUploadModal({
  projectId,
  projectTitle,
  chapter,
  onClose,
}: NewChapterUploadModalProps) {
  const router = useRouter();
  const titleId = useId();
  const isEdit = chapter !== undefined;
  const {
    data: lectures,
    isPending: isLecturesPending,
    isError: isLecturesError,
  } = useProjectSummaries();
  const createChapterMutation = useCreateChapter();
  const updateChapterMutation = useUpdateChapter(projectId);
  const isPending =
    createChapterMutation.isPending || updateChapterMutation.isPending;

  // 수정 모드는 지금 값에서 시작한다. 닫을 때 통째로 언마운트되므로 초기값만 잡아 주면
  // 다음에 열 때 최신 값으로 다시 채워진다.
  const [targetProjectId, setTargetProjectId] = useState(
    chapter?.projectId ?? projectId,
  );
  const [title, setTitle] = useState(chapter?.title ?? '');
  const [lectureDate, setLectureDate] = useState(chapter?.lectureDate ?? '');
  const [professor, setProfessor] = useState(chapter?.professor ?? '');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  // 전송 진행률 0~1. 업로드가 시작되면 폼 대신 대기 화면이 이 값을 그린다.
  const [progress, setProgress] = useState(0);
  // 지금 진행 중인 업로드를 멈추는 손잡이. 대기 화면의 "업로드 취소"가 당긴다.
  const abortRef = useRef<AbortController | null>(null);

  // 주차를 올릴 수 있는 건 내 강의뿐이라 공유받은 강의(sharedBy 있음)는 뺀다.
  // 목록이 아직 안 왔거나 응답에 지금 강의가 빠져 있어도,
  // 보고 있는 강의만큼은 항상 고를 수 있어야 한다.
  // 지금 강의의 제목은 목록보다 상세 응답이 최신이라 상세 쪽을 따른다.
  const options = useMemo(() => {
    const list = (lectures ?? [])
      .filter((l) => l.sharedBy === null)
      .map((l) => ({
        id: l.projectId,
        title: l.projectId === projectId ? projectTitle : l.title,
      }));
    return list.some((o) => o.id === projectId)
      ? list
      : [{ id: projectId, title: projectTitle }, ...list];
  }, [lectures, projectId, projectTitle]);

  // 파일이 하나도 없는 주차는 STT도 요약도 만들 수 없어 status: 'BEFORE'로 남는다.
  // 강의자료와 요약본을 나란히 보는 게 이 제품의 전부라, 그런 주차는 만들어 봐야 아무것도 못 한다.
  // 수정 모드에서는 이미 올라간 파일이 그대로 유지되므로 새로 고르지 않아도 된다.
  const hasMaterial =
    materialFile !== null || Boolean(chapter?.materialFileName);
  const hasAudio = audioFile !== null || Boolean(chapter?.audioFileName);
  // 응답에 파일 이름 필드가 아예 없으면 이 주차에 무엇이 올라가 있는지 알 수 없다.
  // 모른다는 이유로 막으면 제목만 고치려던 사람까지 갇히므로, 알 수 없을 때는 막지 않는다.
  // (백엔드가 필드를 채워 주면 이 분기는 자연히 꺼진다)
  const fileStateUnknown =
    isEdit &&
    chapter.materialFileName === undefined &&
    chapter.audioFileName === undefined;
  const hasAnyFile = fileStateUnknown || hasMaterial || hasAudio;

  // 수정 모드는 바뀐 게 있어야 저장을 연다 (LectureFormModal과 같은 규칙).
  // 없으면 아무것도 안 고치고 눌러도 요청이 나가고, 버튼도 늘 눌리는 것처럼 보인다.
  const changed =
    !isEdit ||
    title.trim() !== chapter.title ||
    lectureDate !== chapter.lectureDate ||
    (professor.trim() || null) !== chapter.professor ||
    targetProjectId !== chapter.projectId ||
    materialFile !== null ||
    audioFile !== null;

  const canSubmit =
    title.trim() !== '' &&
    lectureDate !== '' &&
    targetProjectId !== '' &&
    hasAnyFile &&
    changed &&
    !materialError &&
    !audioError;

  // 업로드 중에는 이 폼이 화면에 없다(대기 화면이 대신 뜬다). 닫는 길은 그쪽 "업로드 취소"뿐이라
  // 배경·ESC로 요청이 조용히 버려질 일은 없다.
  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  // 취소하면 전송이 끊기고 mutation이 UPLOAD_ABORTED로 실패해 폼으로 돌아온다.
  const handleCancel = () => abortRef.current?.abort();

  // 업로드 도중 이 컴포넌트가 사라지면(사이드바로 이동하는 등) 요청만 남아 계속 돈다.
  // 진행률도 취소 버튼도 없이 도는 업로드가 되므로 사라질 때 같이 끊는다.
  useEffect(() => () => abortRef.current?.abort(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isPending) return;
    setFormError(null);
    setProgress(0);

    const controller = new AbortController();
    abortRef.current = controller;

    const payload = {
      projectId: targetProjectId,
      title: title.trim(),
      lectureDate,
      professor: professor.trim() || null,
      materialFile,
      audioFile,
      onProgress: setProgress,
      signal: controller.signal,
    };

    const handlers = {
      onSuccess: () => {
        onClose();
        // 다른 강의에 올리거나 다른 강의로 옮겼다면 이 화면에는 아무 변화가 없어
        // 실패처럼 보인다. 그 강의로 따라가 결과를 바로 보여준다.
        if (targetProjectId !== projectId) {
          router.push(`/projects/${targetProjectId}`);
        }
      },
      onError: (error: Error) => {
        // 사용자가 직접 멈춘 건 실패가 아니다. 문구 없이 폼으로 돌아가기만 한다.
        if (error instanceof ApiRequestError && error.code === UPLOAD_ABORTED) {
          return;
        }
        setFormError(
          error.message ||
            (isEdit
              ? '수정에 실패했어요. 잠시 후 다시 시도해 주세요.'
              : '업로드에 실패했어요. 잠시 후 다시 시도해 주세요.'),
        );
      },
    };

    if (isEdit) {
      updateChapterMutation.mutate(
        { ...payload, chapterId: chapter.chapterId },
        handlers,
      );
      return;
    }
    createChapterMutation.mutate(payload, handlers);
  };

  // 업로드가 시작되면 시안(1:5259)대로 화면을 통째로 대기 화면에 넘긴다.
  // 폼을 그대로 두고 위에 덮지 않는 이유는, 200MB가 올라가는 몇 분 동안
  // 사용자가 볼 게 진행률과 취소뿐이기 때문이다.
  if (isPending) {
    return (
      <ChapterUploadOverlay
        message={
          isEdit
            ? '주차 정보를 저장 중입니다...'
            : '새로운 주차를 업로드 중입니다...'
        }
        progress={progress}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Modal
      open
      onClose={handleClose}
      surface="bare"
      labelledBy={titleId}
      // Figma 960px 모달을 화면과 같은 0.72배(≈691px)로. 시안 높이(876px)가 노트북
      // 화면을 넘기므로 패널은 고정하고 안쪽만 스크롤시킨다.
      className="relative flex max-h-[calc(100vh-64px)] w-[691px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border-[0.5px] border-gray-600 bg-gray-900"
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label="닫기"
        disabled={isPending}
        className="absolute top-[23px] right-[23px] z-10 text-gray-400 transition-colors hover:text-gray-100 disabled:cursor-not-allowed disabled:text-gray-700"
      >
        <CloseIcon className="size-5" />
      </button>

      {/* 스크롤바를 어두운 패널에 맞춘다. 기본 스크롤바는 밝은 회색이라
          모달 오른쪽에 흰 띠가 생겨 분위기가 끊긴다.
          scrollbar-color를 모르는 브라우저는 color-scheme:dark가 받아준다. */}
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
        <div className="scrollbar-dark flex min-h-0 flex-1 flex-col overflow-y-auto px-15 pt-11 pb-7 [color-scheme:dark]">
          {/* 시안 32px SemiBold. 모달 전체를 0.72배로 옮겼으므로 제목도 같이 줄이되,
            0.72배(23px)로는 여전히 박스 대비 글자가 커서 절반인 16px까지 내렸다.
            이 크기에서는 SemiBold가 무겁지 않고, 14px 라벨과 구분하는 역할만 한다. */}
          <h2
            id={titleId}
            className="text-[16px] leading-6 font-semibold tracking-[-0.32px] text-gray-100"
          >
            {isEdit ? '주차 정보 수정하기' : '새 주차 업로드'}
          </h2>

          {/* 제목 */}
          <div
            className={cn('mt-4.5 flex flex-col gap-2 pb-8.5', SECTION_DIVIDER)}
          >
            <label htmlFor="chapter-title" className={LABEL}>
              제목
            </label>
            <input
              id="chapter-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해 주세요."
              required
              disabled={isPending}
              className={FIELD_FILLED}
            />
          </div>

          {/* 강의 + 주차 수강 날짜 */}
          <div className={cn('grid grid-cols-2 py-8.5', SECTION_DIVIDER)}>
            <div className="flex flex-col gap-2">
              <label htmlFor="chapter-project" className={LABEL}>
                강의
              </label>
              {/* 네이티브 셀렉트를 쓰되 기본 화살표를 지우고 시안 화살표를 얹는다.
                color-scheme:dark라야 OS가 그리는 목록도 어두운 배경으로 나온다. */}
              <div className={cn('relative', FIELD_WIDTH)}>
                <select
                  id="chapter-project"
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  disabled={isPending}
                  className={cn(
                    FIELD_OUTLINED,
                    'w-full appearance-none pr-9 [color-scheme:dark]',
                  )}
                >
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 size-3 -translate-y-1/2 text-gray-500" />
              </div>
              {/* 목록이 오기 전·실패했을 때는 지금 강의 하나만 남는다.
                안내가 없으면 "고를 수 있는 강의가 이것뿐"으로 오해한다.
                칸이 좁아 두 줄로 접히므로 break-keep으로 단어 중간에서 끊기지 않게 한다. */}
              {isLecturesPending && (
                <p role="status" className={cn(HINT, 'text-gray-500')}>
                  강의 목록을 불러오는 중이에요.
                </p>
              )}
              {isLecturesError && (
                <p role="alert" className={cn(HINT, 'text-error')}>
                  강의 목록을 불러오지 못했어요. 지금 강의에만 올릴 수 있어요.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="chapter-date" className={LABEL}>
                주차 수강 날짜
              </label>
              {/* 날짜는 달력에서만 고른다. 다른 모달과 같은 컨트롤을 써서
                일곱 개 모달의 날짜 입력 방식이 갈리지 않게 한다. */}
              <ModalDateField
                id="chapter-date"
                value={lectureDate}
                onChange={setLectureDate}
                disabled={isPending}
              />
            </div>
          </div>

          {/* 교수명 (선택) */}
          <div className={cn('flex flex-col gap-2 py-8.5', SECTION_DIVIDER)}>
            <label htmlFor="chapter-professor" className={LABEL}>
              교수명 선택 (선택)
            </label>
            <input
              id="chapter-professor"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              placeholder="교수명을 입력해 주세요."
              disabled={isPending}
              className={FIELD_FILLED}
            />
          </div>

          {/* 파일 업로드 2종. 둘 다 고를 필요는 없지만 하나는 있어야 한다(hasAnyFile).
              라벨의 "(선택)" 표기는 시안(528:8664)에 없어 뺀다 — 규칙은 아래 안내 문구가 말해 준다. */}
          <div className="grid grid-cols-2 gap-[13px] pt-8.5">
            <FileDropzone
              kind="material"
              label="강의 자료 업로드"
              file={materialFile}
              onChange={setMaterialFile}
              error={materialError}
              onError={setMaterialError}
              disabled={isPending}
              existingFileName={chapter?.materialFileName}
            />
            <FileDropzone
              kind="audio"
              label="음성 파일 업로드"
              file={audioFile}
              onChange={setAudioFile}
              error={audioError}
              onError={setAudioError}
              disabled={isPending}
              existingFileName={chapter?.audioFileName}
            />
          </div>

          {/* 확정 버튼이 왜 꺼져 있는지 화면에서 알 수 있어야 한다.
              누르고 나서 실패로 알리는 게 아니라, 규칙을 미리 말해 준다. */}
          {!hasAnyFile && (
            <p className={cn(HINT, 'mt-3 text-gray-500')}>
              강의 자료나 음성 파일 중 하나는 올려야 요약을 만들 수 있어요.
            </p>
          )}
        </div>

        {/* 시안 높이(876px)가 노트북 화면을 넘으면 위 영역이 스크롤되는데, 확정 버튼까지
            같이 스크롤되면 버튼이 접힌 아래로 숨는다. 스크롤 밖에 둬 항상 보이게 한다. */}
        <div className="shrink-0 border-t-[0.5px] border-gray-700 px-15 py-5">
          {/* 제출 실패는 사용자가 방금 누른 결과라 보조기기가 바로 읽어야 한다. */}
          {formError && (
            <p role="alert" className={cn(HINT, 'text-error mb-2 text-right')}>
              {formError}
            </p>
          )}

          {/* 확정 액션이라 하늘색(secondary). Button 컴포넌트는 size별 타이포가 고정이라
              시안 크기(346×60 → 249×44)와 겹치고, cn엔 merge가 없어 덮어쓰면 승자가
              생성 순서에 달리므로 이 화면 전용 버튼으로 둔다.
              비활성은 시안대로 gray-400 배경 + 흰 글자.
              디자인 시스템 버튼 섹션에는 아이콘이 없지만 이 화면 시안(주차 정보 수정하기)에는
              구름 아이콘이 얹혀 있다 — 화면 시안을 따른다. */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canSubmit || isPending}
              className="enabled:bg-secondary-400 enabled:hover:bg-secondary-500 relative flex h-11 w-[249px] items-center justify-center rounded-md text-[14px] leading-[22px] font-medium tracking-[-0.28px] transition-colors enabled:text-gray-950 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-100"
            >
              {/* 시안에서 아이콘은 글자 옆이 아니라 버튼 왼쪽에 따로 얹혀 있고, 글자는
                  아이콘과 무관하게 버튼 전체 기준으로 가운데 온다. absolute의 기준이 되도록
                  버튼에 relative를 둔다. 장식이라 글자 색을 따르지 않는다(시안 gray-400). */}
              <CloudUploadIcon className="pointer-events-none absolute top-1/2 left-3.5 size-[19px] -translate-y-1/2 text-gray-400" />
              {isPending
                ? isEdit
                  ? '저장 중…'
                  : '업로드 중…'
                : isEdit
                  ? '수정 완료'
                  : '업로드하기'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
