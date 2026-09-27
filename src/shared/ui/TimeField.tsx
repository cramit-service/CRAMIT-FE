'use client';
// src/shared/ui/TimeField.tsx
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';
import {
  FIELD_ICON,
  FIELD_ICON_SIZE,
  FIELD_TRIGGER,
  OPTION_PANEL,
  OPTION_ROW,
  optionStateClass,
} from '@/shared/ui/fieldStyle';

// 시안의 마감 시간 칸(`00 : 00` + 화살표)은 셀렉트 모양이지 네이티브 <input type="time">이 아니다.
// 네이티브는 브라우저마다 생김새가 다르고 시/분 세그먼트를 직접 타이핑할 수 있어,
// 같은 모달의 날짜 칸(DateField)과 조작 방식이 어긋난다.
// 여기서는 트리거를 button으로 두어 칸 어디를 눌러도 목록이 열리게 한다.

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0'),
);

// 열 하나의 최대 높이. 행이 40(§2 컨트롤 md)이라 딱 다섯 줄이 보이고 나머지는
// 스크롤로 본다. 판의 높이는 이 값이 정한다 — 판에 따로 상한을 주면 그 둘이 어긋나
// 판까지 구르고, 한 팝오버에 스크롤바가 셋 생긴다.
const COLUMN_MAX_HEIGHT = 200;

type Column = 'hour' | 'minute';

interface TimeFieldProps {
  id: string;
  /** 'HH:mm'. 비어 있으면 미선택. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** 라벨을 날짜 칸과 함께 쓰는 자리에서 이 칸이 무엇인지 알린다. */
  ariaLabel?: string;
  /** 거부 이유를 적은 요소의 id. 없는 id를 가리키면 아무것도 안 읽히므로 있을 때만 넘긴다. */
  describedBy?: string;
}

export function TimeField({
  id,
  value,
  onChange,
  disabled,
  ariaLabel,
  describedBy,
}: TimeFieldProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  // 열자마자 고른 값으로 스크롤·포커스를 옮겨야 하는 순간에만 켠다.
  const syncRef = useRef(false);

  // 'HH:mm'은 자릿수가 고정이라 잘라 쓰면 된다. 값이 없으면 아직 아무것도 안 고른 상태다.
  const hour = value ? value.slice(0, 2) : null;
  const minute = value ? value.slice(3, 5) : null;

  const close = useCallback(() => {
    setOpen(false);
    // 팝오버 안에 포커스가 있는 채로 닫으면 포커스가 body로 떨어져 탭 순서가 끊긴다.
    triggerRef.current?.focus();
  }, []);

  const openPopover = () => {
    syncRef.current = true;
    setOpen(true);
  };

  // 바깥을 누르면 닫는다. 팝오버는 absolute라 폼이 스크롤되면 트리거를 따라 움직이므로
  // 스크롤은 따로 들을 필요가 없다. (DateField와 같다)
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    // Escape를 document 캡처 단계로 받는 이유는 DateField와 같다 —
    // 팝오버에 붙이면 모달이 window에서 먼저 받아 통째로 닫힌다.
    const onKeyDownCapture = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      close();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDownCapture, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDownCapture, true);
    };
  }, [open, close]);

  // 열릴 때 두 열을 각각 고른 값 위치로 굴리고, 시 열로 포커스를 넣는다.
  // 값이 없으면 00이 맨 위라 굴릴 것도 없다.
  useEffect(() => {
    if (!open || !syncRef.current) return;
    syncRef.current = false;
    popoverRef.current
      ?.querySelectorAll<HTMLElement>('[data-focus="true"]')
      .forEach((el) => el.scrollIntoView({ block: 'nearest' }));
    popoverRef.current
      ?.querySelector<HTMLElement>('[data-col="hour"][data-focus="true"]')
      ?.focus();
  }, [open]);

  // 시만 고르면 분은 00으로, 분만 고르면 시는 00으로 채운다.
  // 둘 중 하나만 고른 반쪽 값('14:')을 만들면 저장 검증이 통과해 버린다.
  const selectHour = (h: string) => onChange(`${h}:${minute ?? '00'}`);
  const selectMinute = (m: string) => onChange(`${hour ?? '00'}:${m}`);

  const hourFocus = hour ?? HOURS[0];
  const minuteFocus = minute ?? MINUTES[0];

  // 열 안에서는 ↑↓로, 열 사이는 ←→로 옮긴다. 목록이 60개라 탭으로 훑게 두면
  // 칸 하나를 빠져나가는 데만 탭을 예순 번 눌러야 한다.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const focused = document.activeElement as HTMLElement | null;
    const col = focused?.dataset.col as Column | undefined;
    if (!col) return;

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const index = Number(focused?.dataset.index ?? -1);
      const next = index + (e.key === 'ArrowDown' ? 1 : -1);
      popoverRef.current
        ?.querySelector<HTMLElement>(
          `[data-col="${col}"][data-index="${next}"]`,
        )
        ?.focus();
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const target: Column = e.key === 'ArrowRight' ? 'minute' : 'hour';
      if (target === col) return;
      e.preventDefault();
      popoverRef.current
        ?.querySelector<HTMLElement>(
          `[data-col="${target}"][data-focus="true"]`,
        )
        ?.focus();
    }
  };

  const renderColumn = (
    col: Column,
    options: string[],
    selectedValue: string | null,
    focusValue: string,
    onSelect: (option: string) => void,
    label: string,
  ) => (
    <ul
      role="listbox"
      aria-label={label}
      id={`${listId}-${col}`}
      style={{ maxHeight: COLUMN_MAX_HEIGHT }}
      className="overflow-y-auto overscroll-contain"
    >
      {options.map((option, i) => {
        const selected = option === selectedValue;
        return (
          // 역할과 포커스를 한 요소에 둔다. option 안에 button을 넣으면 보조기기가
          // 포커스된 것을 "버튼"으로 읽어 선택 상태를 알리지 않는다.
          <li
            key={option}
            role="option"
            aria-selected={selected}
            data-col={col}
            data-index={i}
            data-focus={option === focusValue}
            // 열 하나가 탭 정지 하나가 되도록 포커스 대상만 탭 순서에 남긴다.
            tabIndex={option === focusValue ? 0 : -1}
            onClick={() => onSelect(option)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              // Space는 막지 않으면 열이 한 화면 굴러간다.
              e.preventDefault();
              onSelect(option);
            }}
            className={cn(
              OPTION_ROW,
              'cursor-pointer text-center transition-colors',
              optionStateClass({ selected, active: false }),
              !selected && 'hover:bg-gray-100 hover:text-gray-800',
            )}
          >
            {option}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={'relative w-full'}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => (open ? close() : openPopover())}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        className={cn(
          FIELD_TRIGGER,
          'flex w-full items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50',
          // 값 색이 gray-300이었다 — well 위에서 2.13:1이라 §4 필드 표의 gray-700(9.95:1)과
          // 다른 색이었고, 같은 모달의 날짜 칸과도 어긋났다.
          value ? 'text-gray-700' : 'text-gray-500',
        )}
      >
        {/* 날짜 칸과 같은 이유로 chevron이 아니다 (DateField 주석 참고) */}
        <span aria-hidden className={FIELD_ICON}>
          <Icon name="time" size={FIELD_ICON_SIZE} />
        </span>
        {/* 빈 칸은 HH:MM이다. 시안은 미선택일 때도 `00 : 00`을 흐리게 뒀는데, 그러면
            이미 0시 0분이 들어 있는 것처럼 읽힌다 — 옆 날짜 칸의 YYYY.MM.DD와 같은
            말투로 "무엇을 넣는 자리인지"만 말한다. */}
        {value ? `${hour}:${minute}` : 'HH:MM'}
        {/* 지우는 자리. 값이 있을 때만 서고, 없을 때도 폭을 차지해 글자가 밀리지 않는다.
            버튼 안에 버튼을 넣을 수 없어(중첩 인터랙티브) 자리만 비우고 실제 ×는
            아래 형제로 얹는다. */}
        <span aria-hidden className="ml-auto size-4 shrink-0" />
      </button>

      {/* 시간은 선택이라 지울 수 있어야 한다(날짜는 필수라 ×가 없다).
          트리거 위에 얹되 z-10으로 올려 클릭이 트리거로 내려가지 않게 한다. */}
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={`${ariaLabel ?? '시간'} 지우기`}
          className="absolute top-1/2 right-4.5 z-10 flex -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-800"
        >
          <Icon name="close" size={FIELD_ICON_SIZE} />
        </button>
      )}

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="시간 선택"
          onKeyDown={handleKeyDown}
          // absolute의 기준은 위 래퍼의 relative다. (CLAUDE.md 4-5)
          className={cn(
            'absolute top-11 right-0 left-0 z-10 grid grid-cols-2',
            OPTION_PANEL,
          )}
        >
          {renderColumn('hour', HOURS, hour, hourFocus, selectHour, '시')}
          {renderColumn(
            'minute',
            MINUTES,
            minute,
            minuteFocus,
            selectMinute,
            '분',
          )}
        </div>
      )}
    </div>
  );
}
