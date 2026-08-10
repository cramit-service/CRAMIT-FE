'use client';
// src/features/todo/components/TodoChecklist.tsx
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { Todo } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { cn } from '@/shared/lib/cn';
import { formatKoreanDate } from '@/shared/lib/date';
import { useTodos } from '@/features/todo/hooks/useTodos';
import { todoName } from '@/features/todo/lib/todoName';
import { TodoFormModal } from './TodoFormModal';

// 마감 표시 — "| 마감일시 2026. 07. 10. (금요일) 13:30". 시간은 있을 때만 붙인다.
function dueLabel(todo: Todo): string {
  const date = formatKoreanDate(todo.dueDate);
  return `| 마감일시 ${date}${todo.dueTime ? ` ${todo.dueTime}` : ''}`;
}

// 배경·라운드는 바깥 카드가 갖고, 여긴 메시지만.
function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex h-full items-center justify-center text-center text-[13px] text-gray-500">
      {children}
    </p>
  );
}

export function TodoChecklist() {
  const { data: todos, isLoading, isError } = useTodos();

  // 완료 토글은 로컬만 반영한다(mock이라 서버 저장 없음). todoId → 덮어쓴 완료값.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  // null이면 닫힘. 'create'는 추가, Todo면 그 할 일의 상세보기(수정).
  // 닫을 때 통째로 언마운트해 입력값이 다음 열기까지 남지 않게 한다.
  const [editing, setEditing] = useState<Todo | 'create' | null>(null);

  // 마감일 오름차순 정렬. 완료 여부는 위치를 바꾸지 않고 색만 바뀐다(시안대로 완료 항목이 사이사이 남는다).
  const sorted = useMemo(
    () =>
      todos
        ? [...todos].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        : [],
    [todos],
  );

  const isDone = (todo: Todo) => overrides[todo.todoId] ?? todo.isCompleted;
  const toggle = (todo: Todo) =>
    setOverrides((prev) => ({ ...prev, [todo.todoId]: !isDone(todo) }));

  return (
    <section className="flex min-h-0 flex-col">
      {/* 제목 행 44는 시안값 — 버튼(128×44)이 행 높이를 정한다.
          이 높이가 어긋나면 아래 카드가 밀려 옆 캘린더 카드와 하단이 안 맞는다. */}
      <div className="mb-1.5 flex items-center justify-between lg:mb-3 lg:h-11">
        <h2 className="text-[18px] leading-7 font-medium tracking-[-0.36px] text-gray-950">
          TODO 체크리스트
        </h2>
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

      {/* 카드는 데이터 유무와 무관하게 항상 렌더 — 크기는 여기(div)에 준다. 비어도 안 줄어든다.
          스크롤은 안쪽 div가 맡는다. 카드가 직접 스크롤하면 스크롤바가 카드 가장자리에 붙어
          시안(우측 6px·상하 12px 안쪽)처럼 띄울 수 없다. 그 여백을 카드의 py/pr이 만든다. */}
      {/* lg 높이는 시안 639 고정 — 옆의 캘린더 카드와 하단이 맞아야 한다.
          예전에는 flex-1로 남는 높이를 채워 뷰포트마다 높이가 달라졌다. */}
      <div className="bg-secondary-100 flex h-124 flex-col rounded-md py-3 pr-1.5 pl-5 lg:h-[639px]">
        <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto overscroll-none pr-4">
          {isLoading ? (
            <StatusMessage>불러오는 중…</StatusMessage>
          ) : isError || !todos ? (
            <StatusMessage>
              할 일을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </StatusMessage>
          ) : sorted.length === 0 ? (
            <StatusMessage>등록된 할 일이 없어요.</StatusMessage>
          ) : (
            <ul>
              {sorted.map((todo) => {
                const done = isDone(todo);
                return (
                  // 체크박스는 완료 토글만, 나머지 영역은 상세보기를 연다.
                  // 그래서 제목을 Checkbox의 label로 넘기지 않고 버튼 안에 직접 그린다.
                  <li key={todo.todoId} className="flex items-start gap-3 py-2">
                    <Checkbox
                      checked={done}
                      onChange={() => toggle(todo)}
                      aria-label={`${todoName(todo)} 완료`}
                    />
                    {/* 버튼이 남는 폭을 다 차지해 제목 오른쪽 빈 자리를 눌러도 상세가 열린다. */}
                    <button
                      type="button"
                      onClick={() => setEditing(todo)}
                      className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1 text-left"
                    >
                      <span
                        className={cn(
                          'text-[14px] leading-5 font-medium tracking-[-0.28px]',
                          done ? 'text-gray-600 line-through' : 'text-gray-800',
                        )}
                      >
                        {todoName(todo)}
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[12px] leading-4.5 tracking-[-0.24px] text-gray-600">
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
                            <span className="text-level-01 text-[12px] leading-4.5 tracking-[-0.24px]">
                              {todo.memo}
                            </span>
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {editing !== null && (
        <TodoFormModal
          todo={editing === 'create' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
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
