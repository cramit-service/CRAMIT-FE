'use client';
// src/features/project/components/NewChapterUploadModal.tsx
import { useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/shared/ui/Modal';
// 강의 목록은 학습하기 화면(study)이 이미 조회한다. 같은 GET /projects를 두 번 정의하지 않고
// 그 훅을 그대로 쓴다 — 쿼리 키도 공유돼 캐시가 한 벌로 유지된다.
import { useProjectSummaries } from '@/features/study/hooks/useProjectSummaries';
import { FileDropzone } from './FileDropzone';
import { ChevronDownIcon, CloseIcon, CloudUploadIcon } from './icons';
import { useCreateChapter } from '../hooks/useCreateChapter';

interface NewChapterUploadModalProps {
  /** 지금 보고 있는 강의(프로젝트). "강의" 셀렉트의 기본값이 된다. */
  projectId: string;
  projectTitle: string;
  onClose: () => void;
}

// 입력 칸 공통 스타일. Figma 시안(높이 56·좌우 패딩 20)을 화면과 같은 0.72배로 줄였다.
// 타이포도 박스와 같은 0.72배를 적용한다(18 → 13). 가이드 4-4는 타이포를 줄이지 말라고 하지만,
// 그 규칙은 전체 화면 기준이라 0.72배로 줄인 모달 안에서는 글자만 남아 박스를 꽉 채운다.
const FIELD_BASE =
  'h-10 rounded-md px-3.5 text-[13px] leading-5 font-medium tracking-[-0.26px] outline-none';
// 제목·교수명처럼 채워진 입력. 값은 흰색, 안내 문구는 한 단계 흐리게 둬서 비어 있는 게 보이게 한다.
const FIELD_FILLED = `${FIELD_BASE} bg-gray-800 text-gray-100 placeholder:text-gray-300 focus:ring-1 focus:ring-secondary-400`;
// 셀렉트·날짜처럼 테두리만 있는 입력. 폭은 호출처가 정한다
// (여기에 w-full을 넣으면 호출처의 고정 폭과 겹쳐 승자가 클래스 생성 순서에 달린다).
const FIELD_OUTLINED = `${FIELD_BASE} border-[0.5px] border-gray-500 bg-transparent text-gray-300 focus:border-secondary-400`;
// 강의·날짜 칸 폭. 시안은 186px(=134px)이지만 "2026-07-21"과 한글 과목명이 잘려서 조금 넓혔다.
const FIELD_WIDTH = 'w-[156px]';

// 라벨도 같은 0.72배 (20 → 14).
const LABEL = 'text-[14px] leading-[22px] tracking-[-0.28px] text-gray-300';
// 보조 문구(상태 안내·에러)는 한 단계 더 작게.
const HINT = 'text-[12px] leading-[18px] tracking-[-0.24px] break-keep';
const SECTION_DIVIDER = 'border-b-[0.5px] border-gray-700';

// 새 주차 업로드 모달. 제목·강의·수강 날짜·교수명을 받고 강의자료(PDF)와 녹음을 올려
// 새 챕터를 만든다. 시안: Figma `내 강의-상세보기-새 주차 업로드` (모달 1:3560).
export function NewChapterUploadModal({
  projectId,
  projectTitle,
  onClose,
}: NewChapterUploadModalProps) {
  const router = useRouter();
  const titleId = useId();
  const {
    data: lectures,
    isPending: isLecturesPending,
    isError: isLecturesError,
  } = useProjectSummaries();
  const { mutate, isPending } = useCreateChapter();

  const [targetProjectId, setTargetProjectId] = useState(projectId);
  const [title, setTitle] = useState('');
  const [lectureDate, setLectureDate] = useState('');
  const [professor, setProfessor] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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

  const canSubmit =
    title.trim() !== '' &&
    lectureDate !== '' &&
    targetProjectId !== '' &&
    !materialError &&
    !audioError;

  // 업로드 중에 배경·ESC로 닫으면 진행 중인 요청이 그대로 버려진다. 끝날 때까지 막는다.
  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isPending) return;
    setFormError(null);

    mutate(
      {
        projectId: targetProjectId,
        title: title.trim(),
        lectureDate,
        professor: professor.trim() || null,
        materialFile,
        audioFile,
      },
      {
        onSuccess: () => {
          onClose();
          // 다른 강의에 올렸다면 이 화면에는 아무 변화가 없어 실패처럼 보인다.
          // 올린 강의로 옮겨 새 주차가 목록에 붙은 걸 바로 보여준다.
          if (targetProjectId !== projectId) {
            router.push(`/projects/${targetProjectId}`);
          }
        },
        onError: (error) =>
          setFormError(
            error.message || '업로드에 실패했어요. 잠시 후 다시 시도해 주세요.',
          ),
      },
    );
  };

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
      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 [scrollbar-width:thin] [scrollbar-color:var(--color-gray-700)_var(--color-gray-900)] flex-col overflow-y-auto px-15 pt-11 pb-7 [color-scheme:dark]"
      >
        {/* 시안 32px SemiBold. 모달 전체를 0.72배로 옮겼으므로 제목도 같이 줄이되,
            0.72배(23px)로는 여전히 박스 대비 글자가 커서 절반인 16px까지 내렸다.
            이 크기에서는 SemiBold가 무겁지 않고, 14px 라벨과 구분하는 역할만 한다. */}
        <h2
          id={titleId}
          className="text-[16px] leading-6 font-semibold tracking-[-0.32px] text-gray-100"
        >
          새 주차 업로드
        </h2>

        {/* 제목 */}
        <div className={`mt-4.5 flex flex-col gap-2 pb-8.5 ${SECTION_DIVIDER}`}>
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
        <div className={`grid grid-cols-2 py-8.5 ${SECTION_DIVIDER}`}>
          <div className="flex flex-col gap-2">
            <label htmlFor="chapter-project" className={LABEL}>
              강의
            </label>
            {/* 네이티브 셀렉트를 쓰되 기본 화살표를 지우고 시안 화살표를 얹는다.
                color-scheme:dark라야 OS가 그리는 목록도 어두운 배경으로 나온다. */}
            <div className={`relative ${FIELD_WIDTH}`}>
              <select
                id="chapter-project"
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                disabled={isPending}
                className={`${FIELD_OUTLINED} w-full appearance-none pr-9 [color-scheme:dark]`}
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
              <p className={`${HINT} text-gray-500`}>
                강의 목록을 불러오는 중이에요.
              </p>
            )}
            {isLecturesError && (
              <p className={`${HINT} text-error`}>
                강의 목록을 불러오지 못했어요. 지금 강의에만 올릴 수 있어요.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="chapter-date" className={LABEL}>
              주차 수강 날짜
            </label>
            {/* 시안은 커스텀 달력이지만 네이티브 date가 키보드 입력·로케일을 그대로 얻는다.
                color-scheme:dark로 글자와 달력 아이콘이 어두운 배경에서 보이게 한다. */}
            <input
              id="chapter-date"
              type="date"
              value={lectureDate}
              onChange={(e) => setLectureDate(e.target.value)}
              required
              disabled={isPending}
              className={`${FIELD_OUTLINED} ${FIELD_WIDTH} [color-scheme:dark]`}
            />
          </div>
        </div>

        {/* 교수명 (선택) */}
        <div className={`flex flex-col gap-2 py-8.5 ${SECTION_DIVIDER}`}>
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

        {/* 파일 업로드 2종 (선택) */}
        <div className="grid grid-cols-2 gap-[13px] pt-8.5">
          <FileDropzone
            kind="material"
            label="강의 자료 업로드 (선택)"
            file={materialFile}
            onChange={setMaterialFile}
            error={materialError}
            onError={setMaterialError}
            disabled={isPending}
          />
          <FileDropzone
            kind="audio"
            label="음성 파일 업로드 (선택)"
            file={audioFile}
            onChange={setAudioFile}
            error={audioError}
            onError={setAudioError}
            disabled={isPending}
          />
        </div>

        {formError && (
          <p className={`${HINT} text-error mt-6 text-right`}>{formError}</p>
        )}

        {/* 확정 액션이라 하늘색(secondary). Button 컴포넌트는 size별 타이포가 고정이라
            시안 크기(346×60 → 249×44, 20px Medium → 14px)와 겹친다. cn엔 merge가 없어
            덮어쓰면 승자가 생성 순서에 달리므로 이 화면 전용 버튼으로 둔다.
            시안에서 아이콘은 글자 옆이 아니라 버튼 왼쪽에 따로 얹혀 있고, 글자는
            아이콘과 무관하게 버튼 전체 기준으로 가운데 온다. absolute의 기준이 되도록
            버튼에 relative를 둔다. */}
        <button
          type="submit"
          disabled={!canSubmit || isPending}
          className="enabled:bg-secondary-400 enabled:hover:bg-secondary-500 relative mt-6 ml-auto flex h-11 w-[249px] items-center justify-center rounded-md text-[14px] leading-[22px] font-medium tracking-[-0.28px] transition-colors enabled:text-gray-950 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
        >
          {/* 장식용이라 글자 색을 따르지 않는다 (시안 #cecfd1 = gray-400) */}
          <CloudUploadIcon className="pointer-events-none absolute top-1/2 left-3 size-[19px] -translate-y-1/2 text-gray-400" />
          {isPending ? '업로드 중…' : '업로드하기'}
        </button>
      </form>
    </Modal>
  );
}
