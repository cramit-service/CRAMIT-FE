'use client';
// src/features/project/components/LectureFormModal.tsx
import { useId, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { FIELD_ERROR, FIELD_LABEL } from '@/shared/ui/fieldStyle';
import { FormModal } from '@/shared/ui/FormModal';
import { Input } from '@/shared/ui/Input';
import {
  buildSubjectColorMap,
  firstUnusedColorIndex,
} from '@/shared/lib/subjectColor';
import type { ProjectSummary } from '@/shared/types/api';
import {
  useCreateLecture,
  useUpdateLecture,
} from '@/features/project/hooks/useLectureMutations';
import { useProjectSummaries } from '@/features/study/hooks/useProjectSummaries';
import { SubjectColorField } from './SubjectColorField';

interface LectureFormModalProps {
  /** 있으면 수정 모드(주차 목록 헤더의 연필), 없으면 생성 모드(1:2614). */
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
  // 생성 때 교수명을 비우면 "미정"이 채워진다. 수정 화면에서 그게 그대로 보이면
  // 사용자가 직접 쓴 값처럼 보이므로 빈 칸으로 되돌려 준다.
  const [professor, setProfessor] = useState(
    project?.professor === '미정' ? '' : (project?.professor ?? ''),
  );
  const [formError, setFormError] = useState<string | null>(null);

  // 과목 색. 사용자가 고르기 전엔 null이고 기본값은 목록에서 정한다 — 목록이 아직 안 왔을 수
  // 있어(강의 상세에서 열 때) 초기 state로 굳히지 않고 매 렌더 파생시킨다.
  const [pickedColor, setPickedColor] = useState<number | null>(null);
  const { data: summaries } = useProjectSummaries();
  const colorMap = buildSubjectColorMap(summaries);
  const taken = new Set(
    [...colorMap]
      .filter(([projectId]) => projectId !== project?.projectId)
      .map(([, index]) => index),
  );
  // 수정이면 지금 화면에 보이는 색, 생성이면 아직 안 쓰인 첫 색.
  const defaultColor = isEdit
    ? (colorMap.get(project.projectId) ?? project.colorIndex)
    : summaries
      ? firstUnusedColorIndex(taken)
      : null;
  const colorIndex = pickedColor ?? defaultColor;

  const busy = createMutation.isPending || updateMutation.isPending;

  // 필수는 강의명 하나다. 교수명은 (선택)이고, 시험 날짜는 이 모달에서 빠졌다 —
  // 시험은 강의에 딸린 별개 자료라 홈의 시험 일정에서 다룬다.
  const filled = title.trim() !== '';
  // 수정 모드에서는 바꾼 게 있어야 저장을 연다.
  const changed =
    !isEdit ||
    title.trim() !== project.title ||
    (professor.trim() || '미정') !== project.professor ||
    colorIndex !== defaultColor;
  const canSubmit = filled && changed && !busy;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setFormError(null);

    const payload = {
      // 이 모달은 시험 날짜를 묻지 않는다. 수정일 때 기존 값을 그대로 돌려보내 덮어쓰지
      // 않게 한다 — examDate: string | null 계약이라 없으면 null이다.
      title: title.trim(),
      examDate: project?.examDate ?? null,
      professor: professor.trim() || null,
      // 목록을 끝내 못 받아 기본값이 없으면 첫 색으로 보낸다.
      colorIndex: colorIndex ?? 1,
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
      open
      title={isEdit ? '강의 정보 수정하기' : '새 강의 생성하기'}
      // §6: 확정·파괴 버튼은 ~하기로 끝난다. `완료`는 누른 뒤에 참이 되는 말이라
      // 누르기 직전에 읽히는 버튼의 말이 아니다. 눌린 동안은 자기 낱말 + `중…`이므로
      // 저장이 아니라 수정이다.
      submitLabel={
        isEdit
          ? busy
            ? '수정 중…'
            : '수정하기'
          : busy
            ? '생성 중…'
            : '생성하기'
      }
      submitDisabled={!canSubmit}
      busy={busy}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      {/* 색 점이 강의명 왼쪽에 붙는다 — 이름과 색이 한 줄에 있어야 "이 과목의 색"으로 읽힌다. */}
      <div className="flex flex-col gap-2">
        <label htmlFor={`${fieldId}-title`} className={FIELD_LABEL}>
          강의
        </label>
        <div className="flex gap-3">
          <SubjectColorField
            id={`${fieldId}-color`}
            value={colorIndex}
            onChange={setPickedColor}
            taken={taken}
            disabled={busy}
          />
          {/* 라벨은 이 줄 위에 하나뿐이라 Input에 넘기지 않는다 — 색 칸과 이름 칸이
              "강의" 하나를 같이 받는다. 바깥 label의 htmlFor가 이 id를 가리킨다. */}
          <div className="min-w-0 flex-1">
            <Input
              id={`${fieldId}-title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="강의 명을 입력해 주세요."
              required
              disabled={busy}
            />
          </div>
        </div>
      </div>

      <Input
        id={`${fieldId}-professor`}
        label="교수명 (선택)"
        value={professor}
        onChange={(e) => setProfessor(e.target.value)}
        placeholder="교수명을 입력해 주세요."
        disabled={busy}
      />

      {formError && (
        <p role="alert" className={cn(FIELD_ERROR, 'text-right')}>
          {formError}
        </p>
      )}
    </FormModal>
  );
}
