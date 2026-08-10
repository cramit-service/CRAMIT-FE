'use client';
// src/features/project/components/LectureFormModal.tsx
import { useId, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import {
  FIELD_FILLED,
  FormModal,
  HINT,
  LABEL,
  PRIMARY_ACTION,
  SECTION_DIVIDER,
} from '@/shared/ui/FormModal';
import { ModalDateField } from '@/shared/ui/ModalDateField';
import type { ProjectSummary } from '@/shared/types/api';
import {
  useCreateLecture,
  useUpdateLecture,
} from '@/features/project/hooks/useLectureMutations';

interface LectureFormModalProps {
  /** 있으면 수정 모드(강의 상세 헤더의 연필), 없으면 생성 모드(1:2614). */
  project?: ProjectSummary;
  onClose: () => void;
}

// 내 강의 생성·수정 모달. 시안: Figma `학습하기-내 강의 생성하기` (1:2614).
// 시안에는 "제목"과 "강의" 자유 입력이 나란히 있으나 강의 이름을 담을 필드가 title 하나뿐이라
// "강의"만 남기고 그 값을 title로 보낸다.
// 수정 시안은 따로 없어 같은 폼을 수정 모드로 쓴다.
export function LectureFormModal({ project, onClose }: LectureFormModalProps) {
  const fieldId = useId();
  const isEdit = project !== undefined;

  const createMutation = useCreateLecture();
  const updateMutation = useUpdateLecture();

  const [title, setTitle] = useState(project?.title ?? '');
  const [examDate, setExamDate] = useState(project?.examDate ?? '');
  // 생성 때 교수명을 비우면 "미정"이 채워진다. 수정 화면에서 그게 그대로 보이면
  // 사용자가 직접 쓴 값처럼 보이므로 빈 칸으로 되돌려 준다.
  const [professor, setProfessor] = useState(
    project?.professor === '미정' ? '' : (project?.professor ?? ''),
  );
  const [formError, setFormError] = useState<string | null>(null);

  const busy = createMutation.isPending || updateMutation.isPending;

  // 교수명만 (선택)이고 강의명·시험 날짜는 시안에 선택 표기가 없어 필수로 둔다.
  const filled = title.trim() !== '' && examDate !== '';
  // 수정 모드에서는 바꾼 게 있어야 저장을 연다.
  const changed =
    !isEdit ||
    title.trim() !== project.title ||
    examDate !== (project.examDate ?? '') ||
    (professor.trim() || '미정') !== project.professor;
  const canSubmit = filled && changed && !busy;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setFormError(null);

    const payload = {
      title: title.trim(),
      examDate,
      professor: professor.trim() || null,
    };

    const onError = (error: Error) =>
      setFormError(
        error.message || '저장에 실패했어요. 잠시 후 다시 시도해 주세요.',
      );

    if (isEdit) {
      updateMutation.mutate(
        { ...payload, projectId: project.projectId },
        { onSuccess: () => onClose(), onError },
      );
      return;
    }
    // 목록 맨 앞에 새 카드가 붙으므로 이 화면에 그대로 머물러도 결과가 보인다.
    createMutation.mutate(payload, { onSuccess: () => onClose(), onError });
  };

  return (
    <FormModal
      title={isEdit ? '내 강의 수정하기' : '내 강의 생성하기'}
      onClose={onClose}
      onSubmit={handleSubmit}
      busy={busy}
      footer={
        <button type="submit" disabled={!canSubmit} className={PRIMARY_ACTION}>
          {isEdit
            ? busy
              ? '저장 중…'
              : '수정완료'
            : busy
              ? '생성 중…'
              : '생성하기'}
        </button>
      }
    >
      {/* 강의명 */}
      <div className={cn('flex flex-col gap-2 pb-8.5', SECTION_DIVIDER)}>
        <label htmlFor={`${fieldId}-title`} className={LABEL}>
          강의
        </label>
        <input
          id={`${fieldId}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="강의 명을 입력해 주세요."
          required
          disabled={busy}
          className={FIELD_FILLED}
        />
      </div>

      {/* 시험 날짜 */}
      <div className={cn('flex flex-col gap-2 py-8.5', SECTION_DIVIDER)}>
        <label htmlFor={`${fieldId}-exam-date`} className={LABEL}>
          시험 날짜
        </label>
        {/* 날짜는 달력에서만 고른다 (세그먼트 직접 입력·Enter 제출 차단) */}
        <ModalDateField
          id={`${fieldId}-exam-date`}
          value={examDate}
          onChange={setExamDate}
          disabled={busy}
        />
      </div>

      {/* 교수명 (선택) */}
      <div className="flex flex-col gap-2 pt-8.5">
        <label htmlFor={`${fieldId}-professor`} className={LABEL}>
          교수명 선택 (선택)
        </label>
        <input
          id={`${fieldId}-professor`}
          value={professor}
          onChange={(e) => setProfessor(e.target.value)}
          placeholder="교수명을 작성해 주세요."
          disabled={busy}
          className={FIELD_FILLED}
        />
      </div>

      {formError && (
        <p role="alert" className={cn(HINT, 'text-error mt-6 text-right')}>
          {formError}
        </p>
      )}
    </FormModal>
  );
}
