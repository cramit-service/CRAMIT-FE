'use client';
// src/shared/ui/Select.tsx
// DESIGN.md §4 "Four things pick from a list, and they share one list".
//
// 넷 중 이것만 필드가 아니다 — 쓰는 즉시 화면이 바뀌고 제출되는 값이 아니라서,
// 필드의 칸이 아니라 줄 안에 선 액션의 칸을 쓴다. 목록은 나머지 셋과 같은 한 벌이다.
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { control, type ControlSize } from '@/shared/ui/control';
import {
  OPTION_LIST,
  OPTION_ROW,
  optionStateClass,
} from '@/shared/ui/fieldStyle';
import { Icon } from '@/shared/ui/Icon';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  /** 무엇을 고르는 것인지. 옆에 글자가 없으면 반드시 준다. */
  label: string;
  size?: ControlSize;
  disabled?: boolean;
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  size,
  disabled,
}: SelectProps<T>) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

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

  const pick = (option: SelectOption<T>) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    // relative 필수 — 목록이 absolute다. 없으면 위치 기준이 문서 최상위가 되고
    // 스크롤 컨테이너를 탈출해 페이지 높이를 밀어낸다.
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) {
            e.stopPropagation();
            setOpen(false);
            return;
          }
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!open) {
              setOpen(true);
              return;
            }
            const step = e.key === 'ArrowDown' ? 1 : -1;
            setActive((i) => (i + step + options.length) % options.length);
            return;
          }
          if ((e.key === 'Enter' || e.key === ' ') && open) {
            e.preventDefault();
            pick(options[active]);
          }
        }}
        className={cn(
          control(size),
          'bg-surface flex w-full items-center justify-between gap-1 rounded-md px-4.5',
          'border border-gray-100 font-medium whitespace-nowrap text-gray-700',
          'transition-colors duration-150 ease-out',
          'focus-visible:ring-sky-ink focus-visible:ring-2 focus-visible:outline-none',
          disabled ? 'cursor-not-allowed text-gray-400' : 'hover:bg-well',
        )}
      >
        {selected?.label}
        <span
          className={cn('shrink-0 transition-transform', open && 'rotate-180')}
        >
          <Icon name="arrow-down" size={16} />
        </span>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className={cn(OPTION_LIST, 'absolute top-full right-0 mt-1')}
        >
          {options.map((option, i) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(option)}
              className={cn(
                OPTION_ROW,
                optionStateClass({
                  selected: option.value === value,
                  active: i === active,
                }),
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
