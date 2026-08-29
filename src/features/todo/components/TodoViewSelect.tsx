'use client';
// src/features/todo/components/TodoViewSelect.tsx
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import {
  shortDateLabel,
  useTodoFilter,
  type TodoFilter,
} from '@/features/todo/hooks/useTodoFilter';

// 보기 드롭다운. 시안의 색 규칙만 가져오고 크기는 옆 "추가하기"(Button의 xs)에 맞춘다.
// 시안 치수(트리거 101×40 · 목록 175 폭 · 행 56)를 그대로 쓰면 제목 줄이 28에서 40으로
// 늘어나는데, 그 28이 캘린더 열과 카드 위아래를 맞추는 기준이라 TODO 카드만 내려앉는다.
// 목록을 흰 판이 아니라 gray-700으로 채우는 것도 시안값이다 — 하늘색 카드 위에서 묻힌다.
//
// ModalCombobox를 쓰지 않은 이유: 그건 검색이 필요한 긴 목록용이고 모달 전용 스타일이다.

const KIND_LABEL: Record<'upcoming' | 'past' | 'done', string> = {
  upcoming: '다음 할 일',
  past: '지난 할 일',
  done: '완료된 할 일',
};

// 날짜 항목은 캘린더에서 날짜를 고른 뒤에만 생긴다.
function optionsFor(
  filter: TodoFilter,
): { filter: TodoFilter; label: string }[] {
  const base: { filter: TodoFilter; label: string }[] = [
    { filter: { kind: 'upcoming' }, label: KIND_LABEL.upcoming },
    { filter: { kind: 'past' }, label: KIND_LABEL.past },
    { filter: { kind: 'done' }, label: KIND_LABEL.done },
  ];
  if (filter.kind === 'date') {
    base.push({ filter, label: shortDateLabel(filter.date) });
  }
  return base;
}

function labelFor(filter: TodoFilter): string {
  if (filter.kind === 'date') return shortDateLabel(filter.date);
  return KIND_LABEL[filter.kind];
}

export function TodoViewSelect() {
  const { filter, setFilter } = useTodoFilter();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const options = optionsFor(filter);

  // 바깥을 누르면 닫는다. click이 아니라 mousedown이라야 항목을 고르는 클릭과 엇갈리지 않는다.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    // relative 필수 — 아래 목록이 absolute다. 없으면 위치 기준이 문서 최상위가 된다.
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        className="flex h-7 w-25 cursor-pointer items-center justify-between gap-1 rounded-md border-[0.5px] border-gray-500 px-3 text-[12px] font-medium tracking-[-0.24px] whitespace-nowrap text-gray-600 transition-colors hover:border-gray-600"
      >
        {labelFor(filter)}
        <ChevronDownIcon
          className={cn('size-3.5 text-gray-400', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          // 제목 줄은 카드 위라 목록이 카드를 덮는다. 오른쪽을 트리거에 맞춘다.
          className="absolute top-8 right-0 z-10 w-25 overflow-hidden rounded-md bg-gray-700"
        >
          {options.map((option) => {
            const selected = option.label === labelFor(filter);
            return (
              <li key={option.label}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setFilter(option.filter);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex h-7 w-full cursor-pointer items-center px-3 text-left text-[12px] font-medium tracking-[-0.24px] transition-colors',
                    selected
                      ? 'bg-primary-400 text-gray-950'
                      : 'text-gray-300 hover:bg-gray-600',
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('shrink-0 transition-transform', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
