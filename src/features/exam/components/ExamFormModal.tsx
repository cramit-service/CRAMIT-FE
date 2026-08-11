'use client';
// src/features/exam/components/ExamFormModal.tsx
import { useId, useState } from 'react';
import type { Exam } from '@/shared/types/api';
import { cn } from '@/shared/lib/cn';
import { toLocalDateString } from '@/shared/lib/date';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { LectureCombobox } from './LectureCombobox';
import {
  FIELD_FILLED,
  FIELD_OUTLINED,
  HINT,
  LABEL,
  SECTION_DIVIDER,
} from './fieldStyles';
import { useCreateExam } from '@/features/exam/hooks/useCreateExam';
import { useDeleteExam } from '@/features/exam/hooks/useDeleteExam';
import { useUpdateExam } from '@/features/exam/hooks/useUpdateExam';

interface ExamFormModalProps {
  /** 수정할 시험. 없으면 생성 모드. */
  exam?: Exam;
  onClose: () => void;
}

// 제목 최대 길이. 시안(수정 모달 1:1375)의 안내 문구 기준.
// maxLength로 잘라내지 않는 이유: 잘리면 왜 안 써지는지 알 수 없다. 넘치면 이유를 보여준다.
const TITLE_MAX = 10;

// 시험 일정 추가·수정 모달. 폼(제목·강의·시험 날짜·메모)은 두 모드가 완전히 같고,
// 초기값·버튼 줄·제출 대상 세 곳만 갈린다. 그래서 컴포넌트를 나누지 않았다.
// 시안: Figma 추가 1:1345 / 수정 1:1733.
export function ExamFormModal({ exam, onClose }: ExamFormModalProps) {
  const titleId = useId();
  const fieldId = useId();

  // exam의 유무가 곧 모드다. mode prop을 따로 두면 mode="edit"인데 exam이 없는
  // 상태를 만들 수 있어, 진실의 출처를 하나로 둔다.
  const isEdit = exam !== undefined;

  const create = useCreateExam();
  const update = useUpdateExam();
  const remove = useDeleteExam();
  const isPending = create.isPending || update.isPending || remove.isPending;

  const [title, setTitle] = useState(exam?.title ?? '');
  const [projectId, setProjectId] = useState(exam?.projectId ?? '');
  const [examDate, setExamDate] = useState(exam?.examDate ?? '');
  const [memo, setMemo] = useState(exam?.memo ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  // 앞뒤 공백은 어차피 제출할 때 잘라내므로 길이도 자른 뒤로 센다.
  const trimmedTitle = title.trim();
  const isTitleTooLong = trimmedTitle.length > TITLE_MAX;

  const canSubmit =
    trimmedTitle !== '' &&
    !isTitleTooLong &&
    projectId !== '' &&
    examDate !== '' &&
    !isPending;

  // 지난 날짜로 만들면 "다가오는 시험" 목록에서 곧바로 사라져 실패한 것처럼 보인다.
  // 이미 지난 시험을 수정 중이면 그 날짜까지는 열어둬야 다른 칸만 고칠 수 있다.
  const today = toLocalDateString(new Date());
  const minDate = exam && exam.examDate < today ? exam.examDate : today;

  // 이미 열려 있을 때 다시 부르면 브라우저가 예외를 던진다.
  // (네이티브 달력 아이콘 클릭은 브라우저가 먼저 열고 onClick도 뒤따라 온다)
  const openDatePicker = (input: HTMLInputElement) => {
    try {
      input.showPicker();
    } catch {
      // 이미 열려 있으면 그대로 둔다
    }
  };

  // 저장 중에도 닫을 수 있어야 한다. 무효화를 맡은 onSuccess는 훅 옵션이라 언마운트 뒤에도
  // 실행되므로 만들어진 시험은 목록에 반영된다. 반대로 닫기를 막으면 응답이 오래 걸릴 때
  // 모달을 빠져나갈 방법이 아예 없어진다.
  const handleClose = () => onClose();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setFormError(null);

    const fields = {
      projectId,
      title: trimmedTitle,
      examDate,
      memo: memo.trim() || null,
    };
    const handlers = {
      onSuccess: () => onClose(),
      onError: (error: Error) =>
        setFormError(
          error.message || '저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        ),
    };

    if (exam) {
      update.mutate({ examId: exam.examId, ...fields }, handlers);
    } else {
      create.mutate(fields, handlers);
    }
  };

  // 시안에 확인 단계가 없어 누르는 즉시 지운다.
  const handleDelete = () => {
    if (!exam || isPending) return;
    setFormError(null);

    remove.mutate(exam.examId, {
      onSuccess: () => onClose(),
      onError: (error) =>
        setFormError(
          error.message || '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.',
        ),
    });
  };

  const submitLabel = isEdit
    ? update.isPending
      ? '저장 중…'
      : '수정완료'
    : create.isPending
      ? '만드는 중…'
      : '생성하기';

  return (
    <Modal
      open
      onClose={handleClose}
      surface="bare"
      labelledBy={titleId}
      // Figma 960px 모달을 화면과 같은 0.72배(≈691px)로. 닫기 버튼과 sr-only 제목이
      // absolute라서 relative가 필요하다 — 없으면 문서 최상위를 기준으로 잡는다. (CLAUDE.md 4-5)
      className="relative flex max-h-[calc(100vh-64px)] w-172.75 max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border-[0.5px] border-gray-600 bg-gray-900"
    >
      {/* 시안에는 제목이 없지만 aria-labelledby가 가리킬 대상은 있어야 한다.
          이게 없으면 스크린리더가 이 모달을 그냥 "대화 상자"로만 읽는다. */}
      <h2 id={titleId} className="sr-only">
        {isEdit ? '시험 일정 수정' : '시험 일정 추가'}
      </h2>

      <button
        type="button"
        onClick={handleClose}
        aria-label="닫기"
        className="absolute top-5.75 right-5.75 z-10 text-gray-400 transition-colors hover:text-gray-100"
      >
        <Icon name="close" size={20} />
      </button>

      {/* 스크롤바를 어두운 패널에 맞춘다. 기본 스크롤바는 밝은 회색이라
          모달 오른쪽에 흰 띠가 생겨 분위기가 끊긴다. */}
      <form
        onSubmit={handleSubmit}
        className="scrollbar-dark flex min-h-0 flex-col overflow-y-auto px-15 pt-15 pb-7 scheme-dark"
      >
        {/* 제목 — 시안대로 안내 문구를 라벨 줄 오른쪽 끝에 붙인다. */}
        <div className={cn('flex flex-col gap-2 pb-8.5', SECTION_DIVIDER)}>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={`${fieldId}-title`} className={LABEL}>
              제목
            </label>
            {isTitleTooLong && (
              <p
                id={`${fieldId}-title-error`}
                role="alert"
                className={cn(HINT, 'text-error')}
              >
                {TITLE_MAX}자 이내의 제목을 작성해 주세요.
              </p>
            )}
          </div>
          <input
            id={`${fieldId}-title`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해 주세요."
            required
            disabled={isPending}
            aria-invalid={isTitleTooLong}
            // 에러가 있을 때만 연결한다. 없는 id를 가리키면 스크린리더가 아무것도 못 읽는다.
            aria-describedby={
              isTitleTooLong ? `${fieldId}-title-error` : undefined
            }
            className={cn(FIELD_FILLED, 'w-full')}
          />
        </div>

        {/* 강의 — 목록에서 고른 것만 값이 된다. 이유는 LectureCombobox 주석 참고.
            수정 시안(1:1733)은 "선택 없음"이 있는 셀렉트지만, 강의 없는 시험은 만들지 않기로 해
            추가 모달과 같은 콤보박스로 통일했다. */}
        <div className={cn('flex flex-col gap-2 py-8.5', SECTION_DIVIDER)}>
          <label htmlFor={`${fieldId}-lecture`} className={LABEL}>
            강의
          </label>
          <LectureCombobox
            id={`${fieldId}-lecture`}
            value={projectId}
            onChange={setProjectId}
            disabled={isPending}
          />
        </div>

        {/* 시험 날짜 */}
        <div className={cn('flex flex-col gap-2 py-8.5', SECTION_DIVIDER)}>
          <label htmlFor={`${fieldId}-date`} className={LABEL}>
            시험 날짜
          </label>
          {/* 시안은 커스텀 달력이지만 네이티브 date가 로케일·달력 UI를 그대로 얻는다. (#49와 같은 판단)
              날짜는 캘린더로만 고른다. 세그먼트 직접 입력을 막으면 "캘린더에서 Enter를 눌렀는데
              폼이 제출되던" 문제도 같이 막힌다 — type="date"도 폼 안의 일반 input이다.
              캘린더가 열린 뒤의 방향키·Enter는 브라우저가 처리해 키보드로도 고를 수 있다. */}
          <input
            id={`${fieldId}-date`}
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            onClick={(e) => openDatePicker(e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === 'Tab') return; // 포커스 이동은 살려둔다
              const canOpenPicker =
                typeof e.currentTarget.showPicker === 'function';
              // Enter는 어디서든 막는다. 날짜를 고르려던 Enter에 폼이 제출되면 안 된다.
              if (e.key === 'Enter') {
                e.preventDefault();
                if (canOpenPicker) openDatePicker(e.currentTarget);
                return;
              }
              // showPicker가 없는 브라우저에서까지 키를 막으면 날짜를 넣을 방법이 사라진다.
              // 그런 환경에서는 세그먼트 직접 입력이 유일한 수단이라 그대로 둔다.
              if (!canOpenPicker) return;
              e.preventDefault();
              if (e.key === ' ') openDatePicker(e.currentTarget);
            }}
            min={minDate}
            required
            disabled={isPending}
            className={cn(FIELD_OUTLINED, 'w-39 cursor-pointer scheme-dark')}
          />
        </div>

        {/* 메모 (선택) */}
        <div className="flex flex-col gap-2 pt-8.5">
          <label htmlFor={`${fieldId}-memo`} className={LABEL}>
            메모 작성 (선택)
          </label>
          <input
            id={`${fieldId}-memo`}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 작성해 주세요."
            disabled={isPending}
            className={cn(FIELD_FILLED, 'w-full')}
          />
        </div>

        {/* 제출·삭제 실패는 사용자가 방금 누른 결과라 보조기기가 바로 읽어야 한다. */}
        {formError && (
          <p role="alert" className={cn(HINT, 'text-error mt-6 text-right')}>
            {formError}
          </p>
        )}

        {/* 시안 크기: 삭제 190×60 → 137×43, 제출 346×60 → 249×43 (0.72배).
            제출 버튼의 ml-auto가 두 모드를 다 처리한다 — 삭제가 없으면 혼자 오른쪽으로,
            있으면 삭제를 왼쪽 끝에 남기고 오른쪽으로 밀린다.
            공통 Button은 size별 타이포가 고정이라 이 크기와 겹친다. cn엔 merge가 없어
            덮어쓰면 승자가 생성 순서에 달리므로 이 화면 전용 버튼으로 둔다. (#49와 같은 이유) */}
        <div className="mt-6 flex">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="enabled:bg-error flex h-11 w-34.25 items-center justify-center rounded-md text-[14px] leading-5.5 font-medium tracking-[-0.28px] transition-colors enabled:text-white enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
            >
              {remove.isPending ? '삭제 중…' : '삭제하기'}
            </button>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className="enabled:bg-secondary-400 enabled:hover:bg-secondary-500 ml-auto flex h-11 w-62.25 items-center justify-center rounded-md text-[14px] leading-5.5 font-medium tracking-[-0.28px] transition-colors enabled:text-gray-950 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
