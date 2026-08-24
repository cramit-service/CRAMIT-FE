'use client';
// src/features/exam/components/ExamFormModal.tsx
import { useId, useState } from 'react';
import type { Exam } from '@/shared/types/api';
import { cn } from '@/shared/lib/cn';
import { toLocalDateString } from '@/shared/lib/date';
import {
  DANGER_ACTION,
  FIELD_FILLED,
  FormModal,
  HINT,
  LABEL,
  PRIMARY_ACTION,
  SECTION_DIVIDER,
  SECTION_GAP,
} from '@/shared/ui/FormModal';
import { ModalDateField } from '@/shared/ui/ModalDateField';
import { LectureCombobox } from './LectureCombobox';
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
    <FormModal
      title={isEdit ? '시험 일정 수정' : '시험 일정 추가'}
      titleVisible
      onClose={onClose}
      onSubmit={handleSubmit}
      busy={isPending}
      footer={
        <>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className={DANGER_ACTION}
            >
              {remove.isPending ? '삭제 중…' : '삭제하기'}
            </button>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className={PRIMARY_ACTION}
          >
            {submitLabel}
          </button>
        </>
      }
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
      <div className={cn('flex flex-col gap-2', SECTION_GAP, SECTION_DIVIDER)}>
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

      {/* 시험 날짜 — TODO 모달과 같은 커스텀 달력. 트리거가 button이라
          세그먼트 직접 입력도, 달력 안 Enter가 폼을 제출하는 일도 애초에 없다. */}
      <div className={cn('flex flex-col gap-2', SECTION_GAP, SECTION_DIVIDER)}>
        <label htmlFor={`${fieldId}-date`} className={LABEL}>
          시험 날짜
        </label>
        <ModalDateField
          id={`${fieldId}-date`}
          value={examDate}
          onChange={setExamDate}
          min={minDate}
          disabled={isPending}
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
    </FormModal>
  );
}
