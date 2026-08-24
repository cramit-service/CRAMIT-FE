'use client';
// src/features/todo/components/TodoFormModal.tsx
import { useId, useMemo, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { toLocalDateString, toLocalTimeString } from '@/shared/lib/date';
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
import { ModalCombobox } from '@/shared/ui/ModalCombobox';
import { ModalDateField } from '@/shared/ui/ModalDateField';
import { ModalTimeField } from '@/shared/ui/ModalTimeField';
// 강의·주차 목록은 study가 이미 조회한다. 같은 요청을 두 번 정의하지 않고 그 훅을 그대로 쓴다
// — 쿼리 키도 공유돼 캐시가 한 벌로 유지된다. (새 주차 업로드 모달과 동일)
import { useProjectSummaries } from '@/features/study/hooks/useProjectSummaries';
import { useChapters } from '@/features/study/hooks/useChapters';
import type { Todo } from '@/shared/types/api';
import {
  useCreateTodo,
  useDeleteTodo,
  useUpdateTodo,
} from '@/features/todo/hooks/useTodoMutations';

interface TodoFormModalProps {
  /** 있으면 수정 모드(1:2137), 없으면 추가 모드(1:1946). 두 시안의 필드 구성은 같다. */
  todo?: Todo;
  onClose: () => void;
}

// "선택 없음" 상태. 빈 문자열을 그대로 쓴다 — useChapters의 enabled 조건이
// 이 값을 보고 요청을 막고, 저장할 때는 null로 바꿔 보낸다.
const NONE = '';

// TODO 추가·수정 모달.
export function TodoFormModal({ todo, onClose }: TodoFormModalProps) {
  const fieldId = useId();
  const isEdit = todo !== undefined;

  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  const [title, setTitle] = useState(todo?.title ?? '');
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? '');
  const [dueTime, setDueTime] = useState(todo?.dueTime ?? '');
  const [projectId, setProjectId] = useState(todo?.projectId ?? NONE);
  const [lectureId, setLectureId] = useState(todo?.lectureId ?? NONE);
  const [memo, setMemo] = useState(todo?.memo ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  // 지난 시각으로 제출했을 때만 채워진다. 자세한 이유는 handleSubmit 참고.
  const [dueTimeError, setDueTimeError] = useState<string | null>(null);

  const {
    data: lectures,
    isPending: isLecturesPending,
    isError: isLecturesError,
  } = useProjectSummaries();
  // 강의를 고르기 전에는 주차를 물어볼 대상이 없다 — 훅이 enabled로 요청을 막는다.
  const { data: chapters } = useChapters(projectId);

  const lectureOptions = useMemo(
    () => (lectures ?? []).map((l) => ({ value: l.projectId, label: l.title })),
    [lectures],
  );
  const chapterOptions = useMemo(
    () =>
      (chapters ?? []).map((c) => ({
        value: c.chapterId,
        label: `Chapter ${c.chapterNumber} · ${c.title}`,
      })),
    [chapters],
  );

  // 과거로 만들면 홈 캘린더의 지나간 칸에 박혀 사실상 사라진다.
  // 이미 지난 TODO를 수정 중이면 그 날짜까지는 열어둬야 제목·메모만 고칠 수 있다.
  const today = toLocalDateString(new Date());
  const minDueDate = todo && todo.dueDate < today ? todo.dueDate : today;

  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // 날짜나 시간을 고치는 순간 앞서 띄운 경고는 더 이상 그 값에 대한 것이 아니다.
  const handleDueDateChange = (value: string) => {
    setDueDate(value);
    setDueTimeError(null);
  };
  const handleDueTimeChange = (value: string) => {
    setDueTime(value);
    setDueTimeError(null);
  };

  // 강의를 바꾸면 이전 강의의 주차가 남아 있으면 안 된다. 같이 비운다.
  const handleProjectChange = (value: string) => {
    setProjectId(value);
    setLectureId(NONE);
  };

  const filled = title.trim() !== '' && dueDate !== '';
  // 수정 모드에서는 바꾼 게 있어야 저장을 연다 (시안에서도 변경 전에는 수정완료가 회색이다).
  const changed =
    !isEdit ||
    title.trim() !== todo.title ||
    dueDate !== todo.dueDate ||
    (dueTime || null) !== todo.dueTime ||
    (projectId || null) !== todo.projectId ||
    (lectureId || null) !== todo.lectureId ||
    (memo.trim() || null) !== todo.memo;
  const canSubmit = filled && changed && !busy;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setFormError(null);

    // 시각은 고른 뒤에도 시간이 흐르면 저절로 과거가 된다. canSubmit에 넣어 버튼을 잠그면
    // 현재 시각을 계속 다시 읽어야 하고, 모달을 열어둔 사이 버튼이 혼자 회색이 된다.
    // 그래서 제출하는 그 순간에만 재고, 막을 때는 이유를 보여준다.
    // (날짜가 오늘이 아니면 볼 필요가 없다 — 지난 날짜는 달력이 이미 막았다.)
    if (
      dueDate === today &&
      dueTime !== '' &&
      dueTime < toLocalTimeString(new Date())
    ) {
      setDueTimeError('이미 지난 시간이에요.');
      return;
    }
    setDueTimeError(null);

    const payload = {
      projectId: projectId || null,
      title: title.trim(),
      dueDate,
      dueTime: dueTime || null,
      lectureId: lectureId || null,
      memo: memo.trim() || null,
    };

    const onError = (error: Error) =>
      setFormError(
        error.message || '저장에 실패했어요. 잠시 후 다시 시도해 주세요.',
      );

    if (isEdit) {
      updateMutation.mutate(
        { ...payload, todoId: todo.todoId },
        { onSuccess: onClose, onError },
      );
      return;
    }
    createMutation.mutate(payload, { onSuccess: onClose, onError });
  };

  // 시안에 확인 단계가 없어 누르는 즉시 지운다.
  const handleDelete = () => {
    if (!isEdit || busy) return;
    setFormError(null);
    deleteMutation.mutate(todo.todoId, {
      onSuccess: onClose,
      onError: (error) =>
        setFormError(
          error.message || '삭제에 실패했어요. 잠시 후 다시 시도해 주세요.',
        ),
    });
  };

  return (
    <FormModal
      title={isEdit ? 'TODO 수정' : 'TODO 추가'}
      onClose={onClose}
      onSubmit={handleSubmit}
      busy={busy}
      footer={
        <>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className={DANGER_ACTION}
            >
              {deleteMutation.isPending ? '삭제 중…' : '삭제하기'}
            </button>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className={PRIMARY_ACTION}
          >
            {isEdit ? '수정완료' : '생성하기'}
          </button>
        </>
      }
    >
      {/* 제목 */}
      <div className={cn('flex flex-col gap-2 pb-8.5', SECTION_DIVIDER)}>
        <label htmlFor={`${fieldId}-title`} className={LABEL}>
          제목
        </label>
        <input
          id={`${fieldId}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력해 주세요."
          required
          disabled={busy}
          className={FIELD_FILLED}
        />
      </div>

      {/* 마감 일시 — 날짜와 시간이 한 라벨 아래 두 칸으로 나뉜다 (시안 2열) */}
      <div className={cn('flex flex-col gap-2', SECTION_GAP, SECTION_DIVIDER)}>
        {/* 에러는 시험 모달의 제목과 같은 자리 — 라벨 줄 오른쪽 끝 */}
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor={`${fieldId}-due-date`} className={LABEL}>
            마감 일시
          </label>
          {dueTimeError && (
            <p
              id={`${fieldId}-due-time-error`}
              role="alert"
              className={cn(HINT, 'text-error')}
            >
              {dueTimeError}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2">
          {/* 날짜도 시간도 목록에서만 고른다 (직접 입력·Enter 제출 차단).
              라벨이 "마감 일시" 하나뿐이라 시간 칸이 무엇인지는 aria-label로 알린다. */}
          <ModalDateField
            id={`${fieldId}-due-date`}
            value={dueDate}
            onChange={handleDueDateChange}
            min={minDueDate}
            disabled={busy}
          />
          <ModalTimeField
            id={`${fieldId}-due-time`}
            ariaLabel="마감 시간 (선택)"
            value={dueTime}
            onChange={handleDueTimeChange}
            disabled={busy}
            describedBy={dueTimeError ? `${fieldId}-due-time-error` : undefined}
          />
        </div>
      </div>

      {/* 강의 (선택) + 연결된 주차 (선택).
          두 콤보박스는 기본이 w-full이라 열을 꽉 채워 서로 맞닿는다. 폭을 잡고
          열 사이 간격(시안 15)을 줘서 떨어뜨린다. */}
      <div
        className={cn(
          'grid grid-cols-2 gap-x-[15px]',
          SECTION_GAP,
          SECTION_DIVIDER,
        )}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor={`${fieldId}-project`} className={LABEL}>
            강의 (선택)
          </label>
          <ModalCombobox
            id={`${fieldId}-project`}
            value={projectId}
            onChange={handleProjectChange}
            options={lectureOptions}
            disabled={busy}
            placeholder="선택 없음"
            clearable
            width="w-[240px]"
          />
          {isLecturesPending && (
            <p role="status" className={cn(HINT, 'text-gray-500')}>
              강의 목록을 불러오는 중이에요.
            </p>
          )}
          {isLecturesError && (
            <p role="alert" className={cn(HINT, 'text-error')}>
              강의 목록을 불러오지 못했어요.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${fieldId}-lecture`} className={LABEL}>
            연결된 주차 (선택)
          </label>
          {/* 강의를 고르기 전에는 고를 주차가 없다. 비활성으로 두어 순서를 알린다. */}
          <ModalCombobox
            id={`${fieldId}-lecture`}
            value={lectureId}
            onChange={setLectureId}
            options={chapterOptions}
            disabled={busy || projectId === NONE}
            placeholder="선택 없음"
            clearable
            width="w-[240px]"
          />
          {projectId === NONE && (
            <p className={cn(HINT, 'text-gray-500')}>
              강의를 먼저 고르면 주차를 연결할 수 있어요.
            </p>
          )}
        </div>
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
          disabled={busy}
          className={FIELD_FILLED}
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
