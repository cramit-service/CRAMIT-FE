'use client';
// src/features/todo/components/TodoChecklist.tsx
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { Todo } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { cn } from '@/shared/lib/cn';
import { formatKoreanDate } from '@/shared/lib/date';
import { useTodos } from '../hooks/useTodos';
import { todoName } from '../lib/todoName';

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
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-[18px] leading-7 font-medium tracking-[-0.36px] text-gray-950">
          TODO 체크리스트
        </h2>
        {/* TODO: 추가 모달 연결 (이번 작업은 버튼 UI까지) — ExamSchedule 추가하기와 동일 버튼 */}
        <Button
          variant="dark"
          size="sm"
          className="flex h-7 items-center gap-0.5 text-[12px] leading-none font-medium tracking-[-0.24px]"
        >
          추가하기
          <PlusIcon className="size-3" />
        </Button>
      </div>

      {/* 카드는 데이터 유무와 무관하게 항상 렌더 — 크기는 여기(div)에 준다. 비어도 안 줄어든다. */}
      <div className="bg-secondary-100 h-124 [scrollbar-width:none] overflow-y-auto overscroll-none rounded-md px-5 py-3 lg:h-auto lg:min-h-0 lg:flex-1 [&::-webkit-scrollbar]:hidden">
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
                <li key={todo.todoId} className="flex flex-col gap-1 py-2">
                  <Checkbox
                    checked={done}
                    onChange={() => toggle(todo)}
                    label={
                      <span
                        className={cn(
                          'text-[14px] leading-5 font-medium tracking-[-0.28px]',
                          done ? 'text-gray-600 line-through' : 'text-gray-800',
                        )}
                      >
                        {todoName(todo)}
                      </span>
                    }
                  />
                  {/* 마감일시·메모는 체크박스(20px)+gap(12px)=32px 만큼 들여써 제목 시작선에 맞춘다. */}
                  <div className="flex flex-col gap-0.5 pl-8">
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
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
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
