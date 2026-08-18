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

// 내 강의 생성·수정 모달.
// 시안: 생성 `새 강의 생성하기`(1:2614) / 수정 `강의 정보 수정하기`(528:7764, 528:8107).
// 두 시안의 차이는 제목 문구와 시험 날짜 칸 하나뿐이라 한 폼을 모드로 나눠 쓴다.
// 시험 날짜는 생성 시안에 없고 수정 시안에만 "(선택)"으로 있다.
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

  // 시안에서 필수는 강의명 하나뿐이다 — 교수명은 (선택)이고,
  // 시험 날짜는 생성 시안에 아예 없고 수정 시안에서도 "(선택)"이다.
  const filled = title.trim() !== '';
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
      // 생성에는 날짜 칸이 없고 수정에서도 비울 수 있다. 빈 문자열은 날짜가 아니라 미입력이므로
      // examDate: string | null 계약에 맞춰 null로 보낸다.
      title: title.trim(),
      examDate: examDate || null,
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
      title={isEdit ? '강의 정보 수정하기' : '새 강의 생성하기'}
      titleVisible
      // 이 모달의 시안 제목은 32px SemiBold다(0.72배 = 23px). 기본값 16px은
      // 공유하기 모달 기준이라 여기서만 덮어쓴다. 아래 여백은 시안 8px(=6px).
      titleClassName="mb-1.5 text-[23px] leading-8 font-semibold tracking-[-0.46px] text-gray-100"
      onClose={onClose}
      onSubmit={handleSubmit}
      busy={busy}
      footer={
        <button type="submit" disabled={!canSubmit} className={PRIMARY_ACTION}>
          {isEdit
            ? busy
              ? '저장 중…'
              : '수정 완료'
            : busy
              ? '생성 중…'
              : '생성하기'}
        </button>
      }
    >
      {/* 강의명.
          시안(1:2686)은 칸이 적어 여백이 넉넉하다 — 섹션 위아래 48px(=34.5),
          라벨과 입력칸 사이 24px(=17). 주차 모달(12px=8)과 값이 다르다. */}
      <div className={cn('flex flex-col gap-[17px] py-8.5', SECTION_DIVIDER)}>
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

      {/* 시험 날짜 (선택) — 수정 시안에만 있는 칸이다. 생성 시안에는 없다. */}
      {isEdit && (
        <div className={cn('flex flex-col gap-[17px] py-8.5', SECTION_DIVIDER)}>
          <label htmlFor={`${fieldId}-exam-date`} className={LABEL}>
            시험 날짜 (선택)
          </label>
          {/* 날짜는 달력에서만 고른다 (세그먼트 직접 입력·Enter 제출 차단) */}
          <ModalDateField
            id={`${fieldId}-exam-date`}
            value={examDate}
            onChange={setExamDate}
            disabled={busy}
          />
        </div>
      )}

      {/* 교수명 (선택) */}
      <div className="flex flex-col gap-[17px] pt-8.5">
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
