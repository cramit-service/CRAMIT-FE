'use client';
// src/shared/ui/DateField.tsx
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { toLocalDateString } from '@/shared/lib/date';
import {
  FIELD_ICON,
  FIELD_ICON_SIZE,
  FIELD_LABEL,
  FIELD_TRIGGER,
} from '@/shared/ui/fieldStyle';

// 시안의 날짜 칸은 달력에서 고르는 것만 허용한다 — 네이티브 <input type="date">는
// 세그먼트를 직접 타이핑할 수 있고 그 상태로 Enter를 치면 폼이 제출된다.
// 여기서는 트리거를 button으로 두어 두 경로를 한 번에 막는다.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
// 6주 × 7일. 달마다 높이가 들쭉날쭉하지 않게 항상 42칸으로 고정한다.
const CELLS = 42;

// 달력 격자. 홈 캘린더와 같은 일요일 시작이다 — 한 화면에서 두 달력의 요일 순서가
// 다르면 날짜를 잘못 고른다.
// features/calendar/lib/month.ts에 같은 계산이 있다 — 그쪽은 홈 캘린더 전용이고
// 이 컴포넌트는 shared라 지금은 각자 둔다. 한쪽으로 합치는 정리가 남아 있다.
function buildGrid(year: number, month: number): Date[] {
  const first = new Date(year, month - 1, 1);
  // getDay()는 0=일 ~ 6=토. 일요일 시작이라 이 값이 곧 앞쪽 채움 칸 수가 된다.
  const leading = first.getDay();
  return Array.from({ length: CELLS }, (_, i) => {
    const d = new Date(year, month - 1, 1 - leading + i);
    return d;
  });
}

// 'YYYY-MM-DD' → "2026. 08. 10." (시안 표기)
// 칸에 보이는 값과 placeholder가 같은 모양이어야 한다 — 빈 칸이 "무엇을 넣는지"를
// 그 자리에서 말한다(YYYY.MM.DD → 2026.09.28).
function formatDisplay(value: string): string {
  const [y, m, d] = value.split('-');
  return `${y}.${m}.${d}`;
}

// 값을 Date로 읽는다. 'YYYY-MM-DD'가 정상이지만 백엔드가 ISO 타임스탬프를 주거나
// 값이 깨져 있을 수 있다. 그대로 getFullYear()를 부르면 NaN이 buildGrid까지 흘러가
// 달력이 통째로 빈 칸이 된다. 읽지 못하면 오늘로 돌린다.
function parseValue(value: string): Date {
  if (value) {
    // 날짜만 온 값은 T00:00:00을 붙여 로컬 자정으로 읽는다(UTC 파싱이면 하루 밀린다).
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

interface DateFieldProps {
  id: string;
  /** 칸 위에 서는 이름. 라벨 하나가 칸 여럿을 덮는 자리는 FieldGroup을 쓴다. */
  label?: string;
  /** 'YYYY-MM-DD'. 비어 있으면 미선택. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** 라벨이 따로 없는 자리(마감 시간 옆 등)에서 이 칸이 무엇인지 알린다. */
  ariaLabel?: string;
  /** 'YYYY-MM-DD'. 이 날 이전은 고를 수 없다. 지난 날짜 차단용. */
  min?: string;
}

export function DateField({
  id,
  label,
  value,
  onChange,
  disabled,
  ariaLabel,
  min,
}: DateFieldProps) {
  const gridId = useId();
  const [open, setOpen] = useState(false);
  // 보고 있는 달. 값이 있으면 그 달, 없으면 이번 달에서 시작한다.
  const [view, setView] = useState(() => {
    const base = parseValue(value);
    return { year: base.getFullYear(), month: base.getMonth() + 1 };
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // 격자로 포커스를 옮겨야 하는 순간에만 켠다 — 달력을 막 열었을 때와,
  // 화살표 키가 달 경계를 넘어 새 달을 그렸을 때.
  // 이 플래그 없이 view가 바뀔 때마다 옮기면 "다음 달" 버튼을 누르는 순간
  // 포커스가 날짜 칸으로 끌려가 버튼을 연달아 누를 수 없다.
  const focusGridRef = useRef(false);

  const close = useCallback(() => {
    setOpen(false);
    // 팝오버 안에 포커스가 있는 채로 닫으면 포커스가 body로 떨어져 탭 순서가 끊긴다.
    triggerRef.current?.focus();
  }, []);

  const openPopover = () => {
    // 값이 있으면 그 달을 다시 펴 준다 (닫는 사이 달을 넘겨 뒀을 수 있다).
    if (value) {
      const d = parseValue(value);
      setView({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }
    // 막 열렸으니 격자로 포커스를 옮긴다.
    focusGridRef.current = true;
    setOpen(true);
  };

  // 바깥을 누르면 닫는다. 팝오버는 absolute라 폼이 스크롤되면 트리거를 따라 움직이므로
  // 스크롤은 따로 들을 필요가 없다.
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

    // Escape는 팝오버 엘리먼트가 아니라 document에서 캡처 단계로 받는다.
    // 달을 넘기면 포커스를 갖던 날짜 버튼이 사라져 포커스가 body로 떨어진다. 그때의
    // Escape는 팝오버 DOM을 타지 않으므로, 팝오버에 붙인 핸들러로는 못 막고
    // 모달이 window에서 받아 통째로 닫혀 버린다. 캡처 단계면 포커스 위치와 무관하게
    // 우리가 먼저 받아 달력만 닫을 수 있다.
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

  useEffect(() => {
    if (!open || !focusGridRef.current) return;
    focusGridRef.current = false;
    gridRef.current
      ?.querySelector<HTMLButtonElement>('[data-focus="true"]')
      ?.focus();
  }, [open, view.year, view.month]);

  const shift = (delta: number) => {
    setView((v) => {
      const d = new Date(v.year, v.month - 1 + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
  };

  const select = (date: Date) => {
    onChange(toLocalDateString(date));
    setOpen(false);
    triggerRef.current?.focus();
  };

  // 격자 안에서 화살표로 날짜를 옮긴다. 달 경계를 넘으면 보고 있는 달도 함께 넘긴다.
  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const step =
      e.key === 'ArrowLeft'
        ? -1
        : e.key === 'ArrowRight'
          ? 1
          : e.key === 'ArrowUp'
            ? -7
            : e.key === 'ArrowDown'
              ? 7
              : 0;
    if (step === 0) return;
    e.preventDefault();

    const focused = document.activeElement as HTMLElement | null;
    const index = Number(focused?.dataset.index ?? -1);
    if (index < 0) return;

    const next = index + step;
    if (next >= 0 && next < CELLS) {
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`[data-index="${next}"]`)
        ?.focus();
      return;
    }
    // 격자 밖으로 나가면 달을 넘긴다. 새 달이 그려진 뒤 포커스는 위 useEffect가 잡는다.
    focusGridRef.current = true;
    shift(next < 0 ? -1 : 1);
  };

  const cells = buildGrid(view.year, view.month);
  const today = toLocalDateString(new Date());
  // 'YYYY-MM-DD'는 자릿수가 고정이라 문자열 비교가 곧 날짜 비교다.
  const isBlocked = (iso: string) => min !== undefined && iso < min;

  // 포커스를 처음 받을 칸 — 고른 날이 이 달에 있으면 그 날, 없으면 고를 수 있는 첫 날.
  // 고를 수 있는 날이 하나도 없는 달(전체가 min 이전)이면 첫 칸으로 떨어진다.
  // aria-disabled라 그 칸도 포커스를 받으므로 화살표로 빠져나올 수 있다.
  const monthCells = cells
    .filter((d) => d.getMonth() + 1 === view.month)
    .map(toLocalDateString);
  const focusTarget =
    value &&
    !isBlocked(value) &&
    cells.some((d) => toLocalDateString(d) === value)
      ? value
      : (monthCells.find((iso) => !isBlocked(iso)) ?? monthCells[0]);

  const field = (
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
        // button은 폼 검증 대상이 아니라 required를 걸 수 없다(aria-required도 role=button엔
        // 안 맞는다). 빈 날짜로 제출되는 건 각 모달의 canSubmit이 막는다.
        className={cn(
          FIELD_TRIGGER,
          'flex w-full items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50',
          value ? 'text-gray-700' : 'text-gray-500',
        )}
      >
        {/* chevron이 아니라 달력이다. aria-haspopup이 이미 둘을 갈라 놨다 —
            Select는 listbox라 목록이 아래로 떨어지지만 이건 dialog라 새 판이 열린다.
            화면이 그걸 따라오지 않아 셋 다 같은 화살표를 달고 있었다. */}
        <span aria-hidden className={FIELD_ICON}>
          <Icon name="calendar" size={FIELD_ICON_SIZE} />
        </span>
        {value ? formatDisplay(value) : 'YYYY.MM.DD'}
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="날짜 선택"
          // absolute의 기준은 위 래퍼의 relative다. (CLAUDE.md 4-5)
          className="bg-surface shadow-near absolute top-11 left-0 z-10 w-60 rounded-md border border-gray-100 p-2"
        >
          {/* 달 이동 */}
          <div className="mb-1 flex items-center justify-between">
            <IconButton
              name="arrow-left"
              aria-label="이전 달"
              rank="plain"
              onClick={() => shift(-1)}
            />
            <span
              aria-live="polite"
              className="text-body-sm font-medium text-gray-800"
            >
              {view.year}년 {view.month}월
            </span>
            <IconButton
              name="arrow-right"
              aria-label="다음 달"
              rank="plain"
              onClick={() => shift(1)}
            />
          </div>

          {/* 요일 */}
          <div className="grid grid-cols-7">
            {WEEKDAYS.map((w) => (
              <span
                key={w}
                aria-hidden
                className="text-label flex h-6 items-center justify-center font-medium text-gray-500"
              >
                {w}
              </span>
            ))}
          </div>

          {/* 날짜 */}
          <div
            ref={gridRef}
            id={gridId}
            onKeyDown={handleGridKeyDown}
            className="grid grid-cols-7"
          >
            {cells.map((date, i) => {
              const iso = toLocalDateString(date);
              const inMonth = date.getMonth() + 1 === view.month;
              const selected = iso === value;
              const blocked = isBlocked(iso);
              return (
                <button
                  key={iso}
                  type="button"
                  data-index={i}
                  data-focus={iso === focusTarget}
                  // 격자 전체가 탭 정지 하나가 되도록 포커스 대상만 탭 순서에 남긴다.
                  tabIndex={iso === focusTarget ? 0 : -1}
                  // disabled가 아니라 aria-disabled다. disabled 버튼은 focus()를
                  // 받지 않아, 차단된 칸으로 화살표를 옮기면 포커스가 body로 떨어지고
                  // 그 뒤로 격자 안에서 아무 키도 듣지 않게 된다. 고를 수 없다는 사실은
                  // 보조기기에 알리되 포커스는 계속 받게 두고, 고르는 것만 막는다.
                  onClick={() => {
                    if (blocked) return;
                    select(date);
                  }}
                  aria-disabled={blocked}
                  aria-pressed={selected}
                  aria-current={iso === today ? 'date' : undefined}
                  // 고른 날은 연두 채움, 오늘은 하늘 원이다.
                  // 연두는 pale이 아니라 action이다 — pale은 §2가 "넓은 면"에 준 값이고
                  // (Card의 selected), 24px 칸에서는 흰 바탕과 L* 차이가 3밖에 안 나
                  // 고른 날이 안 보인다. 이 칸은 눌린 채로 있는 컨트롤이라 Toggle의
                  // pressed와 같은 자리다.
                  // 오늘은 하늘 링이다. 채움(sky-status)은 흰 바탕과 1.67:1이라 선으로
                  // 쓰면 안 보이고, 선은 §2가 "글자만으로 된 상태"라 부른 ink 쪽이다
                  // (흰 바탕 5.0:1 — WCAG 1.4.11의 3:1을 넘는다).
                  // 검정 원이었을 때는 그게 판에서 가장 센 표시라 고른 날이 묻혔다.
                  className={cn(
                    'text-label flex h-8 items-center justify-center rounded-md font-medium transition-colors',
                    blocked
                      ? 'cursor-not-allowed'
                      : selected
                        ? 'bg-lime-action'
                        : 'hover:bg-gray-100',
                    // 막힌 날은 gray-400(3.0:1)이다. gray-200은 1.5:1이라
                    // "고를 수 없다"가 아니라 "안 보인다"로 읽혔다.
                    blocked
                      ? 'text-gray-400'
                      : inMonth
                        ? 'text-gray-800'
                        : 'text-gray-400',
                  )}
                >
                  {/* 오늘만 원을 두른다. 칸(32×24)에 바로 칠하면 원이 아니라 알약이 된다. */}
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full',
                      iso === today &&
                        !blocked &&
                        'ring-sky-ink text-gray-800 ring-2 ring-inset',
                    )}
                  >
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (!label) return field;
  return (
    <div className="flex w-full flex-col gap-2">
      {/* 판의 기준(relative)은 안쪽 래퍼가 갖는다 — 라벨까지 기준에 들어가면
          달력이 라벨 높이만큼 내려온다. */}
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
      {field}
    </div>
  );
}
