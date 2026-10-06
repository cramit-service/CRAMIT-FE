'use client';
// src/features/todo/components/TodoFormModal.tsx
import { useId, useMemo, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { toLocalDateString, toLocalTimeString } from '@/shared/lib/date';
import { Combobox } from '@/shared/ui/Combobox';
import { DateField } from '@/shared/ui/DateField';
import { FIELD_ERROR } from '@/shared/ui/fieldStyle';
import { FieldGroup } from '@/shared/ui/FieldGroup';
import { FormModal } from '@/shared/ui/FormModal';
import { Input } from '@/shared/ui/Input';
import { TimeField } from '@/shared/ui/TimeField';
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

// "선택 없음" 상태. 선택 칸의 값은 문자열이라 빈 문자열로 둔다.
const NONE = '';

// ID는 숫자다. 폼 안에서는 선택 칸 값(문자열)으로 들고, 폼 밖으로 나갈 때만 바꾼다.
// "선택 없음"은 null이 된다 — useChapters는 null이면 요청하지 않는다.
const toId = (value: string) => (value === NONE ? null : Number(value));

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
  const [projectId, setProjectId] = useState(
    todo?.projectId?.toString() ?? NONE,
  );
  const [chapterId, setChapterId] = useState(
    todo?.chapterId?.toString() ?? NONE,
  );
  const [memo, setMemo] = useState(todo?.memo ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  // 지난 시각으로 제출했을 때만 채워진다. 자세한 이유는 handleSubmit 참고.
  const [dueTimeError, setDueTimeError] = useState<string | null>(null);

  const {
    data: lectures,
    isPending: isLecturesPending,
    isError: isLecturesError,
  } = useProjectSummaries();
  // 강의를 고르기 전에는 주차를 물어볼 대상이 없다 — 훅이 skipToken으로 요청을 막는다.
  // isPending이 아니라 isLoading을 본다 — 요청을 막아 둔 동안에도 status는 계속
  // 'pending'이라, isPending으로 재면 강의를 고르기 전에도 "불러오는 중"이 뜬다.
  const {
    data: chapters,
    isLoading: isChaptersLoading,
    isError: isChaptersError,
  } = useChapters(toId(projectId));

  const lectureOptions = useMemo(
    () =>
      (lectures ?? []).map((l) => ({
        value: String(l.projectId),
        label: l.title,
      })),
    [lectures],
  );
  const chapterOptions = useMemo(
    () =>
      (chapters ?? []).map((c) => ({
        value: String(c.chapterId),
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
    setChapterId(NONE);
  };

  const filled = title.trim() !== '' && dueDate !== '';
  // 수정 모드에서는 바꾼 게 있어야 저장을 연다 (시안에서도 변경 전에는 버튼이 회색이다).
  const changed =
    !isEdit ||
    title.trim() !== todo.title ||
    dueDate !== todo.dueDate ||
    (dueTime || null) !== todo.dueTime ||
    toId(projectId) !== todo.projectId ||
    toId(chapterId) !== todo.chapterId ||
    (memo.trim() || null) !== todo.memo;
  const canSubmit = filled && changed && !busy;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setFormError(null);

    // 시각은 고른 뒤에도 시간이 흐르면 저절로 과거가 된다. canSubmit에 넣어 버튼을
    // 잠그면 모달을 열어둔 사이 버튼이 혼자 회색이 되므로, 제출하는 순간에만 잰다.
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
      projectId: toId(projectId),
      title: title.trim(),
      dueDate,
      dueTime: dueTime || null,
      chapterId: toId(chapterId),
      memo: memo.trim() || null,
    };

    const onError = (error: Error) =>
      setFormError(
        error.message || '저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
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
          error.message || '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.',
        ),
    });
  };

  return (
    <FormModal
      open
      title={isEdit ? 'TODO 수정' : 'TODO 추가'}
      submitLabel={isEdit ? '수정하기' : '생성하기'}
      onDelete={isEdit ? handleDelete : undefined}
      deleteLabel={deleteMutation.isPending ? '삭제 중…' : '삭제하기'}
      submitDisabled={!canSubmit}
      busy={busy}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <Input
        id={`${fieldId}-title`}
        label="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력해 주세요."
        required
        disabled={busy}
      />

      {/* 마감 일시 — 날짜와 시간이 한 라벨 아래 두 칸으로 나뉜다.
          두 반쪽이 한 칸 전체와 정확히 같은 폭을 채운다 (§4: 콤보박스의 두 폭). */}
      <FieldGroup label="마감 일시" required>
        <div className="grid grid-cols-2 gap-4">
          {/* 두 칸 다 FieldGroup의 "마감 일시"를 이름으로 물려받는다. 시간 칸은
              그중 어느 쪽인지를 aria-label로 덧붙인다. */}
          <DateField
            id={`${fieldId}-due-date`}
            ariaLabel="마감 날짜"
            value={dueDate}
            onChange={handleDueDateChange}
            min={minDueDate}
            disabled={busy}
            required
          />
          <TimeField
            id={`${fieldId}-due-time`}
            ariaLabel="마감 시간"
            value={dueTime}
            onChange={handleDueTimeChange}
            disabled={busy}
            describedBy={dueTimeError ? `${fieldId}-due-time-error` : undefined}
          />
        </div>
        {dueTimeError && (
          <p
            id={`${fieldId}-due-time-error`}
            role="alert"
            className={FIELD_ERROR}
          >
            {dueTimeError}
          </p>
        )}
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <Combobox
          id={`${fieldId}-project`}
          label="강의"
          value={projectId}
          onChange={handleProjectChange}
          options={lectureOptions}
          disabled={busy}
          // 로딩은 칸 아래 문구가 아니라 placeholder로 알린다. 문구는 로딩이 끝나면
          // 사라지면서 모달 높이를 줄여 화면이 출렁였다.
          placeholder={isLecturesPending ? '불러오는 중…' : '선택 없음'}
          clearable
          error={isLecturesError ? '강의 목록을 불러오지 못했어요.' : undefined}
        />

        {/* 강의를 고르기 전에는 고를 주차가 없다. 비활성으로 두어 순서를 알리고,
            그 이유는 칸 안(placeholder)에서 말한다 — 칸 아래 문구로 두면 옆 칸과
            높이가 달라지고, 강의를 고르는 순간 사라지면서 모달이 출렁였다.
            실패는 안내가 아니라 사고라 칸 밖에 남긴다 — placeholder로 두면
            "고를 게 없다"와 "못 불러왔다"가 같은 자리에서 같은 말투가 된다. */}
        <Combobox
          id={`${fieldId}-lecture`}
          label="주차"
          value={chapterId}
          onChange={setChapterId}
          options={chapterOptions}
          disabled={busy || projectId === NONE}
          placeholder={
            projectId === NONE
              ? '강의를 먼저 골라 주세요'
              : isChaptersLoading
                ? '불러오는 중…'
                : '선택 없음'
          }
          clearable
          error={isChaptersError ? '주차 목록을 불러오지 못했어요.' : undefined}
        />
      </div>

      <Input
        id={`${fieldId}-memo`}
        label="메모"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모를 입력해 주세요."
        disabled={busy}
      />

      {/* 제출·삭제 실패는 사용자가 방금 누른 결과라 보조기기가 바로 읽어야 한다. */}
      {formError && (
        <p role="alert" className={cn(FIELD_ERROR, 'text-right')}>
          {formError}
        </p>
      )}
    </FormModal>
  );
}
