'use client';
// src/shared/ui/Combobox.tsx
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';
import { FieldLabel } from '@/shared/ui/FieldLabel';
import {
  FIELD_BOX,
  FIELD_ERROR,
  FIELD_INVALID,
  FIELD_ICON,
  FIELD_ICON_SIZE,
  FIELD_PLACEHOLDER,
  OPTION_LIST,
  OPTION_ROW,
  optionStateClass,
} from '@/shared/ui/fieldStyle';

// 강의처럼 목록이 길어질 수 있는 칸은 시안대로 검색해서 고른다.
// 네이티브 select는 검색이 안 되고, 강의가 열 개만 넘어도 찾기 어려워진다.

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  id: string;
  /** 칸 위에 서는 이름. 라벨 하나가 칸 여럿을 덮는 자리는 FieldGroup을 쓴다. */
  label?: string;
  /** 고른 항목의 value. 빈 문자열이면 미선택. */
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  disabled?: boolean;
  placeholder?: string;
  /** 미선택으로 되돌릴 수 있는지 (TODO의 선택 칸들). */
  clearable?: boolean;
  width?: string;
  /** 비워 둘 수 없는 칸. 라벨에 별표가 서고 칸이 aria-required를 갖는다. */
  required?: boolean;
  /** 틀렸다는 말. 테두리를 빨갛게 만들고 아래에 그대로 적는다 (Input과 같다). */
  error?: string;
}

export function Combobox({
  id,
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder = '검색해서 선택',
  clearable = false,
  width = 'w-full',
  required = false,
  error,
}: ComboboxProps) {
  const listId = useId();
  const errorId = `${id}-error`;
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

  const field = (
    <div ref={wrapRef} className={cn('relative', width)}>
      {/* Input과 같은 상자다 — 채움·테두리·여백은 상자가 갖고 input은 그 안에서
          투명하게 깔린다. 화살표를 absolute로 띄우면 글자의 오른쪽 여백을
          18+16+8로 박아야 하는데 42는 §2 간격 목록에 없다. */}
      <div
        className={cn(
          FIELD_BOX,
          // 채움이 필드다. 테두리는 할 말이 있을 때만 나온다 (Input과 같은 규칙).
          error && FIELD_INVALID,
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          // role=combobox는 aria-required를 받는다 (role=button인 DateField와 다르다).
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
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
            'min-w-0 flex-1 cursor-text bg-transparent outline-none',
            // 브라우저 기본 placeholder는 글자색의 50%라 다른 칸보다 연했다.
            `placeholder:${FIELD_PLACEHOLDER}`,
            disabled ? 'cursor-not-allowed text-gray-400' : 'text-gray-700',
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
            className="shrink-0 text-gray-500 transition-colors hover:text-gray-800"
          >
            <Icon name="close" size={FIELD_ICON_SIZE} />
          </button>
        ) : (
          <span aria-hidden className={FIELD_ICON}>
            <Icon name="arrow-down" size={FIELD_ICON_SIZE} />
          </span>
        )}
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          // absolute의 기준은 위 래퍼의 relative다. (CLAUDE.md 4-5)
          className={cn(
            'absolute top-11 right-0 left-0 z-10 max-h-52 overflow-y-auto',
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

  if (!label && !error) return field;
  return (
    <div className={cn('flex flex-col gap-2', width)}>
      {/* 팝오버의 기준(relative)은 안쪽 래퍼가 갖는다 — 라벨까지 기준에 들어가면
          목록이 라벨 높이만큼 내려온다. */}
      {label && (
        <FieldLabel htmlFor={id} required={required}>
          {label}
        </FieldLabel>
      )}
      {field}
      {error && (
        <p id={errorId} role="alert" className={FIELD_ERROR}>
          {error}
        </p>
      )}
    </div>
  );
}
