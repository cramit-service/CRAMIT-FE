'use client';
// src/features/todo/components/TodoChecklist.tsx
import { useMemo, useState } from 'react';
import type { Todo } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button';
import { ScrollArea } from '@/shared/ui/ScrollArea';
import { Checkbox } from '@/shared/ui/Checkbox';
import { IconButton } from '@/shared/ui/IconButton';
import { cn } from '@/shared/lib/cn';
import { formatShortDate, toLocalDateString } from '@/shared/lib/date';
import { useTodos } from '@/features/todo/hooks/useTodos';
import { todoName } from '@/features/todo/lib/todoName';
import {
  useTodoFilter,
  type TodoFilter,
} from '@/features/todo/hooks/useTodoFilter';
import { TodoViewSelect } from './TodoViewSelect';
import { TodoFormModal } from './TodoFormModal';
import { Icon } from '@/shared/ui/Icon';

// 마감 표시 — "9/10 (목) 13:30". 제목과 한 줄에 놓이므로 짧게 간다.
// 시험 일정 목록과 같은 형식이다 — 홈에서 두 카드가 나란히 서는데 한쪽은
// "9/29 (화)", 다른 쪽은 "09.29.(화)"였다.
function dueLabel(todo: Todo): string {
  return `${formatShortDate(todo.dueDate)}${todo.dueTime ? ` ${todo.dueTime}` : ''}`;
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

// 판의 모양. 홈의 카드와 뷰어의 탭 판이 채움·테두리·모서리를 공유하고 높이만 다르다.
const CARD = 'bg-surface flex flex-col rounded-md border border-gray-100';

interface TodoChecklistProps {
  /**
   * 카드 높이를 바깥이 준 만큼으로 바꾼다. 홈에서는 옆 캘린더에 맞춘 고정 높이라야
   * 두 열의 하단이 맞지만, 학습 뷰어의 탭 자리에서는 판이 남은 공간을 채운다.
   */
  fill?: boolean;
}

export function TodoChecklist({ fill = false }: TodoChecklistProps = {}) {
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

  const addButton = (
    // 시험 일정 카드의 추가하기와 같은 부품·같은 라벨이다.
    <Button onClick={() => setEditing('create')}>추가하기</Button>
  );

  // 스크롤은 ScrollArea가 맡는다(시험 일정 카드와 같은 부품·같은 규칙) —
  // 좌우 여백은 판이 아니라 안쪽 목록이 갖고, 막대는 그 여백 위에 선다.
  const list = (
    <ScrollArea>
      {isLoading ? (
        <StatusMessage>불러오는 중…</StatusMessage>
      ) : isError || !todos ? (
        <StatusMessage>
          할 일을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </StatusMessage>
      ) : visible.length === 0 ? (
        <StatusMessage>{emptyMessage}</StatusMessage>
      ) : (
        // 행 사이에 선을 긋지 않는다. 완료한 할 일은 제목에 취소선이 그어지는데,
        // 칸막이까지 있으면 한 화면에 가로선이 스무 개 가까이 깔린다 — 그중 하나만
        // 뜻(완료)이고 나머지는 칸막이라 같은 회색으로는 둘이 구분되지 않는다.
        // 경계는 줄마다 왼쪽에 서는 체크박스가 이미 만든다.
        <ul className="px-6">
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
    </ScrollArea>
  );

  const modal = editing !== null && (
    <TodoFormModal
      todo={editing === 'create' ? undefined : editing}
      onClose={() => setEditing(null)}
    />
  );

  // 학습 뷰어의 탭 자리. 판 하나가 전부다 — 크기가 옆 탭과 같아야 해서 제목 줄을
  // 판 위에 둘 수 없고, 탭 이름이 이미 TODO라 제목도 필요 없다. 보기 선택도 빼서
  // 판 안에는 추가하기만 선다. 여백은 옆의 요약 탭과 같은 px-6 pt-5다.
  // 값을 VIEWER_PANEL에서 가져오지는 않는다 — features끼리 import하면 화살표가
  // 한 방향이 아니게 된다(CLAUDE.md §3).
  if (fill) {
    return (
      <section
        className={cn(CARD, 'h-full min-h-[590px] pb-2')}
        aria-label="TODO 체크리스트"
      >
        <div className="flex justify-end px-6 pt-5 pb-5">{addButton}</div>
        {list}
        {modal}
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-col">
      {/* 제목 행은 옆의 시험 일정 열과 같은 규칙 — 높이를 고정하지 않고 내용(버튼 28)이 정한다.
          고정하면 28짜리 버튼이 가운데 놓이면서 위아래로 빈 자리가 생겨 간격이 그만큼 벌어진다. */}
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-body-md font-semibold text-gray-800">
          TODO 체크리스트
        </h2>
        <div className="flex items-center gap-2">
          <TodoViewSelect />
          {addButton}
        </div>
      </div>

      {/* 카드는 데이터 유무와 무관하게 항상 렌더 — 크기는 여기(div)에 준다. 비어도 안 줄어든다.
          lg 높이는 옆의 캘린더 카드와 하단이 맞아야 한다. 제목 행 규칙이 두 열에서 같으므로
          카드 높이도 캘린더와 같은 654다 — 한쪽을 바꾸면 다른 쪽도 같이 바꿔야 한다.
          예전에는 flex-1로 남는 높이를 채워 뷰포트마다 높이가 달라졌다. */}
      <div className={cn(CARD, 'h-124 py-2 lg:h-[654px]')}>{list}</div>

      {modal}
    </section>
  );
}

// 행 하나. 체크박스와 글자가 한 라벨이라 어디를 눌러도 완료가 토글되고,
// 수정은 호버·포커스 때 뜨는 연필이 연다(시험 일정 행과 같은 규칙).
//
// 전에는 행 전체가 button이고 500ms 길게 누르면 수정이었다. 화면만 봐서는 알 수 없어
// 카드 아래에 "꾹 눌러서 수정할 수 있어요" 안내를 달아야 했고, 키보드에는 길게 누르기가
// 없어 contextmenu(Shift+F10)를 따로 붙여야 했다. 연필은 그 셋을 한꺼번에 없앤다.
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
  return (
    // 한 줄짜리 행이 40이다 — 제목 줄상자 24 + 여백 8×2. §2 컨트롤 높이의 md이고,
    // 이 화면의 필드·버튼과 같은 칸이다.
    <li className="group relative flex items-start gap-3 py-2">
      <Checkbox
        checked={done}
        onChange={onToggle}
        block
        label={
          // min-w-0 — 메모에 띄어쓰기 없는 아주 긴 문자열이 들어오면 flex 자동 최소폭
          // (min-content)이 이 칸을 밀어 넓힌다. 행 상자는 카드 폭에 묶어 둔다.
          <span className="flex min-w-0 flex-col gap-1">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  'text-body-sm truncate font-medium',
                  done ? 'text-gray-500 line-through' : 'text-gray-800',
                )}
              >
                {todoName(todo)}
              </span>
              {/* 연필은 이름 바로 옆이다(시험 일정 행과 같은 자리). 라벨 안이지만
                  체크를 토글하지 않는다 — label은 자기 안의 인터랙티브 요소에서 난
                  클릭을 컨트롤로 넘기지 않는다(HTML 사양). 자리는 늘 차지하고 드러나기만
                  하므로, 호버할 때 이름이나 날짜가 밀리지 않는다. */}
              {/* -my-1 — 버튼은 32(글리프의 두 배, §4)라 그대로 두면 제목 줄(24)을
                  밀어 넓힌다. 줄 높이는 글자가 정하고 버튼은 그 위에 얹힌다. */}
              <span className="-my-1 shrink-0 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
                <IconButton
                  name="edit"
                  aria-label={`${todoName(todo)} 수정`}
                  rank="plain"
                  onClick={onEdit}
                />
              </span>
              <span
                className={cn(
                  'text-label ml-auto shrink-0',
                  done ? 'text-gray-400' : 'text-gray-500',
                )}
              >
                {dueLabel(todo)}
              </span>
            </span>
            {todo.memo && (
              <span className="text-label flex min-w-0 items-center gap-1.5 text-gray-500">
                <span className="flex shrink-0">
                  <Icon name="memo" size={16} />
                </span>
                <span className="truncate">{todo.memo}</span>
              </span>
            )}
          </span>
        }
      />
    </li>
  );
}
