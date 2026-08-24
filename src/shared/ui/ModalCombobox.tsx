'use client';
// src/shared/ui/ModalCombobox.tsx
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import {
  ChevronDownIcon,
  FIELD_OUTLINED,
  OPTION_LIST,
  OPTION_ROW,
  optionStateClass,
} from '@/shared/ui/FormModal';

// 강의처럼 목록이 길어질 수 있는 칸은 시안대로 검색해서 고른다.
// 네이티브 select는 검색이 안 되고, 강의가 열 개만 넘어도 찾기 어려워진다.

export interface ComboboxOption {
  value: string;
  label: string;
}

// 목록이 길어도 화면을 덮지 않게 자른다(max-h-52 = 208px). 나머지는 스크롤로 본다.

interface ModalComboboxProps {
  id: string;
  /** 고른 항목의 value. 빈 문자열이면 미선택. */
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  disabled?: boolean;
  placeholder?: string;
  /** 미선택으로 되돌릴 수 있는지 (TODO의 "강의 (선택)"). */
  clearable?: boolean;
  width?: string;
}

export function ModalCombobox({
  id,
  value,
  onChange,
  options,
  disabled,
  placeholder = '검색해서 선택',
  clearable = false,
  width = 'w-full',
}: ModalComboboxProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  // null이면 "고른 항목을 그대로 보여주는 중", 문자열이면 사용자가 입력한 검색어.
  const [query, setQuery] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;
  const filtered =
    query === null || query.trim() === ''
      ? options
      : options.filter((o) =>
          o.label.toLowerCase().includes(query.trim().toLowerCase()),
        );

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    // 고른 항목이 있으면 그 위치에서 시작한다.
    setHighlight(
      Math.max(
        0,
        filtered.findIndex((o) => o.value === value),
      ),
    );
  };

  const closeList = () => {
    setOpen(false);
    // 검색어를 남겨두면 고른 항목과 다른 글자가 칸에 남아 무엇이 선택됐는지 헷갈린다.
    setQuery(null);
  };

  const commit = (option: ComboboxOption) => {
    onChange(option.value);
    setOpen(false);
    setQuery(null);
  };

  // 바깥을 누르면 닫는다. 목록은 absolute라 폼이 스크롤되면 입력칸을 따라 움직이므로
  // 스크롤은 따로 들을 필요가 없다.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      if (listRef.current?.contains(e.target as Node)) return;
      closeList();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  // 강조된 항목이 보이도록 스크롤을 따라 올린다.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${highlight}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, highlight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        openList();
        return;
      }
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      setHighlight((h) => {
        if (filtered.length === 0) return 0;
        return (h + delta + filtered.length) % filtered.length;
      });
      return;
    }

    if (e.key === 'Enter') {
      // 목록에서 고르는 Enter가 폼 제출로 새어 나가면 안 된다.
      if (open) {
        e.preventDefault();
        const option = filtered[highlight];
        if (option) commit(option);
      }
      return;
    }

    if (e.key === 'Escape' && open) {
      // 모달이 window에서 Escape를 듣는다. 멈추지 않으면 목록만 닫으려다 모달까지 닫힌다.
      e.preventDefault();
      e.stopPropagation();
      closeList();
    }
  };

  return (
    <div ref={wrapRef} className={cn('relative', width)}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && filtered[highlight]
            ? `${listId}-${filtered[highlight].value}`
            : undefined
        }
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={query ?? selected?.label ?? ''}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onFocus={openList}
        // Tab으로 빠져나가면 목록이 떠 있는 채로 남는다. 항목 선택은 mousedown에서
        // 이미 끝나므로 여기서 닫아도 클릭이 씹히지 않는다.
        onBlur={closeList}
        onKeyDown={handleKeyDown}
        className={cn(
          FIELD_OUTLINED,
          'w-full cursor-text pr-9 disabled:cursor-not-allowed disabled:opacity-50',
        )}
      />

      {/* 값이 있고 지울 수 있으면 ×, 아니면 목록 화살표 */}
      {clearable && value && !disabled ? (
        <button
          type="button"
          // 이게 없으면 누르는 순간 입력칸이 blur돼 onBlur가 목록을 닫고, 이어지는
          // focus()가 onFocus를 태워 방금 닫은 목록이 도로 열린다. 포커스를 아예 뺏지 않는다.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onChange('');
            setQuery(null);
            inputRef.current?.focus();
          }}
          aria-label="선택 해제"
          className="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-gray-500 transition-colors hover:text-gray-300"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            className="size-3"
            aria-hidden
          >
            <path d="m5 5 14 14M19 5 5 19" />
          </svg>
        </button>
      ) : (
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 size-3 -translate-y-1/2 text-gray-500" />
      )}

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          // 목록은 absolute다. 위 래퍼의 relative가 기준이 된다 — 없으면 문서 최상위를
          // 기준으로 잡아 모달 밖 엉뚱한 자리에 뜬다. (CLAUDE.md 4-5)
          className={cn(
            'scrollbar-dark absolute top-11 right-0 left-0 z-10 max-h-52 overflow-y-auto',
            OPTION_LIST,
          )}
        >
          {filtered.length === 0 ? (
            <li className={cn(OPTION_ROW, 'text-gray-400')}>
              검색 결과가 없어요.
            </li>
          ) : (
            filtered.map((option, i) => (
              <li
                key={option.value}
                id={`${listId}-${option.value}`}
                role="option"
                aria-selected={option.value === value}
                data-index={i}
                // 입력에서 포커스가 빠지기 전에 고르도록 mousedown으로 받는다.
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(option);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  OPTION_ROW,
                  'cursor-pointer truncate transition-colors',
                  optionStateClass({
                    selected: option.value === value,
                    active: i === highlight,
                  }),
                )}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
