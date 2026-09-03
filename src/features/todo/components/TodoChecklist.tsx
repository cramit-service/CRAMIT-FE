'use client';
// src/features/todo/components/TodoChecklist.tsx
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import type { Todo } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button';
import { CheckboxBox } from '@/shared/ui/Checkbox';
import { cn } from '@/shared/lib/cn';
import { formatKoreanDate, toLocalDateString } from '@/shared/lib/date';
import { useTodos } from '@/features/todo/hooks/useTodos';
import { todoName } from '@/features/todo/lib/todoName';
import { useLongPress } from '@/features/todo/hooks/useLongPress';
import {
  useTodoFilter,
  type TodoFilter,
} from '@/features/todo/hooks/useTodoFilter';
import { TodoViewSelect } from './TodoViewSelect';
import { TodoFormModal } from './TodoFormModal';

// 마감 표시 — "| 마감일시 2026. 07. 10. (금요일) 13:30". 시간은 있을 때만 붙인다.
function dueLabel(todo: Todo): string {
  const date = formatKoreanDate(todo.dueDate);
  return `| 마감일시 ${date}${todo.dueTime ? ` ${todo.dueTime}` : ''}`;
}

// 목록이 비었을 때의 안내. 보기마다 비는 이유가 달라 문구도 다르다.
// 특히 "지난 할 일"은 지난 게 없어서일 수도, 있는데 다 끝내서일 수도 있어 둘 다에 맞는 말로 쓴다.
const EMPTY_MESSAGE: Record<TodoFilter['kind'], string> = {
  upcoming: '다음 할 일이 없어요.',
  past: '밀린 할 일이 없어요.',
  done: '완료한 할 일이 없어요.',
  date: '이 날짜에 등록된 할 일이 없어요.',
};

// 화면에 보이는 완료 여부. 로컬 overrides가 서버 값을 덮어쓴다.
// 목록을 거를 때와 행을 그릴 때가 같은 값을 봐야 해서 한 곳에 둔다.
function isTodoDone(todo: Todo, overrides: Record<string, boolean>): boolean {
  return overrides[todo.todoId] ?? todo.isCompleted;
}

// 배경·라운드는 바깥 카드가 갖고, 여긴 메시지만.
function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-body flex h-full items-center justify-center text-center text-gray-500">
      {children}
    </p>
  );
}

export function TodoChecklist() {
  const { data: todos, isLoading, isError } = useTodos();
  const { filter } = useTodoFilter();

  // 완료 토글은 로컬만 반영한다(mock이라 서버 저장 없음). todoId → 덮어쓴 완료값.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  // null이면 닫힘. 'create'는 추가, Todo면 그 할 일의 상세보기(수정).
  // 닫을 때 통째로 언마운트해 입력값이 다음 열기까지 남지 않게 한다.
  const [editing, setEditing] = useState<Todo | 'create' | null>(null);

  // "오늘"은 보는 사람 기준이라 렌더할 때 계산한다(캘린더의 오늘 표시와 같은 기준).
  const todayStr = toLocalDateString(new Date());

  // 완료 여부는 순서를 바꾸지 않는다 — 시안대로 완료 항목이 사이사이 남는다.
  const visible = useMemo(() => {
    if (!todos) return [];
    const ascending = (a: Todo, b: Todo) => a.dueDate.localeCompare(b.dueDate);
    if (filter.kind === 'date') {
      return todos.filter((t) => t.dueDate === filter.date).sort(ascending);
    }
    if (filter.kind === 'past') {
      // 지난 할 일은 "아직 안 한 것"만 본다 — 이미 끝낸 걸 다시 볼 이유가 없다.
      // 서버 값이 아니라 화면에 체크로 보이는 값(isTodoDone)을 기준으로 삼는다.
      // 그래서 여기서 완료를 누르면 그 항목은 목록에서 곧바로 빠진다.
      // 내림차순 — 가장 최근에 지난 것이 먼저 보이는 게 자연스럽다.
      return todos
        .filter((t) => t.dueDate < todayStr && !isTodoDone(t, overrides))
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    }
    if (filter.kind === 'done') {
      // 완료한 것만 모아 본다. 날짜와 무관해서 지난 것과 앞으로의 것이 같이 나온다.
      // 최근에 끝냈을 법한 쪽이 위로 오도록 내림차순.
      return todos
        .filter((t) => isTodoDone(t, overrides))
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    }
    return todos.filter((t) => t.dueDate >= todayStr).sort(ascending);
  }, [todos, filter, todayStr, overrides]);

  const emptyMessage = EMPTY_MESSAGE[filter.kind];

  const isDone = (todo: Todo) => isTodoDone(todo, overrides);
  const toggle = (todo: Todo) =>
    setOverrides((prev) => ({ ...prev, [todo.todoId]: !isDone(todo) }));

  return (
    <section className="flex min-h-0 flex-col">
      {/* 제목 행은 옆의 시험 일정 열과 같은 규칙 — 높이를 고정하지 않고 내용(버튼 28)이 정한다.
          고정하면 28짜리 버튼이 가운데 놓이면서 위아래로 빈 자리가 생겨 간격이 그만큼 벌어진다. */}
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-body font-medium text-gray-950">TODO 체크리스트</h2>
        <div className="flex items-center gap-2">
          <TodoViewSelect />
          {/* ExamSchedule 추가하기와 동일 버튼 */}
          <Button
            variant="dark"
            size="xs"
            className="gap-0.5"
            onClick={() => setEditing('create')}
          >
            추가하기
            <PlusIcon className="size-3" />
          </Button>
        </div>
      </div>

      {/* 카드는 데이터 유무와 무관하게 항상 렌더 — 크기는 여기(div)에 준다. 비어도 안 줄어든다.
          스크롤은 안쪽 div가 맡는다. 카드가 직접 스크롤하면 스크롤바가 카드 가장자리에 붙어
          시안(우측 6px·상하 12px 안쪽)처럼 띄울 수 없다. 그 여백을 카드의 py/pr이 만든다. */}
      {/* lg 높이는 옆의 캘린더 카드와 하단이 맞아야 한다. 제목 행 규칙이 두 열에서 같으므로
          카드 높이도 캘린더와 같은 654다 — 한쪽을 바꾸면 다른 쪽도 같이 바꿔야 한다.
          예전에는 flex-1로 남는 높이를 채워 뷰포트마다 높이가 달라졌다. */}
      <div className="bg-secondary-100 flex h-124 flex-col rounded-md py-3 pr-1.5 pl-5 lg:h-[654px]">
        <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto overscroll-none pr-4">
          {isLoading ? (
            <StatusMessage>불러오는 중…</StatusMessage>
          ) : isError || !todos ? (
            <StatusMessage>
              할 일을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </StatusMessage>
          ) : visible.length === 0 ? (
            <StatusMessage>{emptyMessage}</StatusMessage>
          ) : (
            <ul>
              {visible.map((todo) => (
                <TodoRow
                  key={todo.todoId}
                  todo={todo}
                  done={isDone(todo)}
                  onToggle={() => toggle(todo)}
                  onEdit={() => setEditing(todo)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 길게 눌러야 수정된다는 걸 화면만 봐서는 알 수 없어 시안(1:1166)의 안내 문구를 카드 아래에 둔다.
          오른쪽 끝을 카드 오른쪽 끝에 맞추고, 옆 캘린더의 범례 줄과 같은 자리(mt-2)에 놓는다. */}
      <p className="text-button-sm mt-2 text-right text-gray-500">
        *꾹 눌러서 TODO를 수정할 수 있어요!
      </p>

      {editing !== null && (
        <TodoFormModal
          todo={editing === 'create' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

// 행 하나. 짧게 누르면 완료 토글, 길게 누르면(500ms) 수정 모달.
// 행 전체가 button이라 안에 input을 넣을 수 없어(중첩 인터랙티브 요소) Checkbox 대신
// 표시 전용 CheckboxBox를 쓴다. role="checkbox" 덕에 키보드 Space/Enter로도 완료된다.
// 길게 누르기는 키보드에 없으므로 수정은 contextmenu로도 연다 — 메뉴 키(Shift+F10)가
// 같은 이벤트를 쏘기 때문이다.
//
// 폭을 calc로 명시하는 이유: <button>은 display:flex를 줘도 블록처럼 늘어나지 않는다.
// -mx-2로 넘긴 16px을 더해 줘야 누르는 중 배경이 좌우로 고르게 깔린다.
function TodoRow({
  todo,
  done,
  onToggle,
  onEdit,
}: {
  todo: Todo;
  done: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { pressing, handlers } = useLongPress({
    // 길게 눌러 여는 경우엔 열기 전에 포커스를 뗀다.
    // 버튼은 마우스로 누르기만 해도 포커스를 가져가고, Modal은 닫힐 때 그 포커스를
    // 되돌려준다(Modal.tsx의 previouslyFocused). 되돌아간 자리가 "누르면 완료되는" 버튼이라
    // 모달을 닫은 뒤 Space로 스크롤만 해도 완료가 토글돼 버린다.
    // contextmenu로 여는 경로는 키보드(Shift+F10)도 쓰므로 포커스를 그대로 둔다.
    onLongPress: () => {
      buttonRef.current?.blur();
      onEdit();
    },
    onPress: onToggle,
  });

  return (
    <li>
      <button
        ref={buttonRef}
        type="button"
        role="checkbox"
        aria-checked={done}
        onContextMenu={(e) => {
          e.preventDefault();
          onEdit();
        }}
        {...handlers}
        className={cn(
          '-mx-2 flex w-[calc(100%+16px)] cursor-pointer gap-3 rounded-sm px-2 py-2 text-left transition-colors select-none',
          'focus-visible:ring-secondary-400 focus-visible:ring-2 focus-visible:outline-none',
          pressing && 'bg-secondary-200/40',
        )}
      >
        <CheckboxBox checked={done} />
        {/* min-w-0 — 메모에 띄어쓰기 없는 아주 긴 문자열이 들어오면 flex 자동 최소폭(min-content)이
            이 칸을 밀어 넓힌다. 글자가 넘치는 건 어차피 못 막지만 행 상자는 카드 폭에 묶어 둔다. */}
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className={cn(
              'text-label font-medium',
              done ? 'text-gray-600 line-through' : 'text-gray-800',
            )}
          >
            {todoName(todo)}
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-button-sm text-gray-600">
              {dueLabel(todo)}
            </span>
            {todo.memo && (
              <span className="flex items-start gap-1">
                {/* 메모 아이콘. SVG라 next/image 최적화 경로를 피하려 unoptimized. */}
                <Image
                  src="/icons/todo_memo.svg"
                  alt=""
                  aria-hidden
                  width={11}
                  height={11}
                  unoptimized
                  className="mt-0.5 size-3 shrink-0"
                />
                <span className="text-level-01 text-button-sm">
                  {todo.memo}
                </span>
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
