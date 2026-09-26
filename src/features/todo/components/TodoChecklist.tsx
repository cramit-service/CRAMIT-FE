'use client';
// src/features/todo/components/TodoChecklist.tsx
import { useMemo, useRef, useState } from 'react';
import type { Todo } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button';
import { CheckboxBox } from '@/shared/ui/Checkbox';
import { cn } from '@/shared/lib/cn';
import { toLocalDateString } from '@/shared/lib/date';
import { useTodos } from '@/features/todo/hooks/useTodos';
import { todoName } from '@/features/todo/lib/todoName';
import { useLongPress } from '@/features/todo/hooks/useLongPress';
import {
  useTodoFilter,
  type TodoFilter,
} from '@/features/todo/hooks/useTodoFilter';
import { TodoViewSelect } from './TodoViewSelect';
import { TodoFormModal } from './TodoFormModal';
import { Icon } from '@/shared/ui/Icon';

// 마감 표시 — "9/10 (목) 13:30". 제목과 한 줄에 놓이므로 짧게 간다.
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
function dueLabel(todo: Todo): string {
  const [year, month, day] = todo.dueDate.split('-').map(Number);
  const weekday = WEEKDAY[new Date(year, month - 1, day).getDay()];
  return `${month}/${day} (${weekday})${todo.dueTime ? ` ${todo.dueTime}` : ''}`;
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
    <p className="text-body text-gray-650 flex h-full items-center justify-center text-center">
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
          <Button onClick={() => setEditing('create')}>
            추가하기
            <Icon name="plus" size={12} />
          </Button>
        </div>
      </div>

      {/* 카드는 데이터 유무와 무관하게 항상 렌더 — 크기는 여기(div)에 준다. 비어도 안 줄어든다.
          스크롤은 안쪽 div가 맡는다. 카드가 직접 스크롤하면 스크롤바가 카드 모서리에 붙는다.
          안쪽의 -mr-3/pr-3은 스크롤바를 카드 우패딩 자리로 빼되 글자는 그대로 두려는 것이다. */}
      {/* lg 높이는 옆의 캘린더 카드와 하단이 맞아야 한다. 제목 행 규칙이 두 열에서 같으므로
          카드 높이도 캘린더와 같은 654다 — 한쪽을 바꾸면 다른 쪽도 같이 바꿔야 한다.
          예전에는 flex-1로 남는 높이를 채워 뷰포트마다 높이가 달라졌다. */}
      <div className="flex h-124 flex-col rounded-lg border border-gray-300 bg-white px-6 py-2 lg:h-[654px]">
        <div className="scrollbar-slim -mr-3 min-h-0 flex-1 overflow-y-auto overscroll-none pr-3">
          {isLoading ? (
            <StatusMessage>불러오는 중…</StatusMessage>
          ) : isError || !todos ? (
            <StatusMessage>
              할 일을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </StatusMessage>
          ) : visible.length === 0 ? (
            <StatusMessage>{emptyMessage}</StatusMessage>
          ) : (
            // 행 사이 선은 둘째 행부터의 위쪽 테두리다. divide-y를 안 쓰는 이유는
            // v4에서 그게 아래쪽 선으로 바뀌어 "첫 행 제외 상단"과 걸리는 요소가 달라서다.
            <ul className="[&>li+li]:border-t [&>li+li]:border-gray-200">
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
      {/* 실제로 알려줘야 하는 문구다. gray-500은 2.06:1이라 안내가 안내로 안 읽혔다. */}
      <p className="text-button-sm text-gray-650 mt-2 text-right">
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
// <button>은 display:flex를 줘도 블록처럼 늘어나지 않아 w-full을 명시한다.
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
          'flex w-full cursor-pointer items-start gap-3.5 py-4 text-left transition-colors select-none',
          'focus-visible:ring-secondary-400 focus-visible:ring-2 focus-visible:outline-none',
          pressing && 'bg-primary-300/40',
        )}
      >
        <CheckboxBox
          checked={done}
          className="mt-px size-5.5 rounded-sm"
          iconClassName="size-3.25"
        />
        {/* min-w-0 — 메모에 띄어쓰기 없는 아주 긴 문자열이 들어오면 flex 자동 최소폭(min-content)이
            이 칸을 밀어 넓힌다. 글자가 넘치는 건 어차피 못 막지만 행 상자는 카드 폭에 묶어 둔다. */}
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-baseline justify-between gap-3">
            <span
              className={cn(
                'truncate text-[17px] leading-6 font-medium',
                done ? 'text-gray-650 line-through' : 'text-gray-900',
              )}
            >
              {todoName(todo)}
            </span>
            <span
              className={cn(
                'flex-none text-[14px] leading-5',
                done ? 'text-gray-400' : 'text-gray-600',
              )}
            >
              {dueLabel(todo)}
            </span>
          </span>
          {todo.memo && (
            <span className="flex min-w-0 items-center gap-1.5 text-gray-600">
              <span className="shrink-0">
                <Icon name="memo" size={13} />
              </span>
              <span className="truncate text-[14px] leading-5">
                {todo.memo}
              </span>
            </span>
          )}
        </span>
      </button>
    </li>
  );
}
