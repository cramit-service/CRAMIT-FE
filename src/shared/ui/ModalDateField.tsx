'use client';
// src/shared/ui/ModalDateField.tsx
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { toLocalDateString } from '@/shared/lib/date';
import {
  ChevronDownIcon,
  FIELD_OUTLINED,
  FIELD_WIDTH,
} from '@/shared/ui/FormModal';

// 시안의 날짜 칸은 달력에서 고르는 것만 허용한다 — 네이티브 <input type="date">는
// 세그먼트를 직접 타이핑할 수 있고 그 상태로 Enter를 치면 폼이 제출된다.
// 여기서는 트리거를 button으로 두어 두 경로를 한 번에 막는다.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
// 6주 × 7일. 달마다 높이가 들쭉날쭉하지 않게 항상 42칸으로 고정한다.
const CELLS = 42;
// 팝오버를 위로 뒤집을지 판단할 때 쓰는 대략 높이(헤더 + 요일 + 6주 + 여백).
const POPOVER_HEIGHT = 296;

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
function formatDisplay(value: string): string {
  const [y, m, d] = value.split('-');
  return `${y}. ${m}. ${d}.`;
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

interface ModalDateFieldProps {
  id: string;
  /** 'YYYY-MM-DD'. 비어 있으면 미선택. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** 라벨이 따로 없는 자리(마감 시간 옆 등)에서 이 칸이 무엇인지 알린다. */
  ariaLabel?: string;
  /** 'YYYY-MM-DD'. 이 날 이전은 고를 수 없다. 지난 날짜 차단용. */
  min?: string;
}

export function ModalDateField({
  id,
  value,
  onChange,
  disabled,
  ariaLabel,
  min,
}: ModalDateFieldProps) {
  const gridId = useId();
  const [open, setOpen] = useState(false);
  // 팝오버는 fixed로 띄운다. 모달 폼이 overflow-y-auto라 absolute로 두면 잘린다.
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(
    null,
  );
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

  // 트리거를 기준으로 팝오버 위치를 다시 잡는다. 열 때와 스크롤·리사이즈 때 같은 계산을 쓴다.
  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // 아래 공간이 모자라면 위로 뒤집는다.
    const below = rect.bottom + 6;
    const flip = below + POPOVER_HEIGHT > window.innerHeight;
    setAnchor({
      top: flip ? rect.top - POPOVER_HEIGHT - 6 : below,
      left: rect.left,
    });
  }, []);

  const openPopover = () => {
    if (!triggerRef.current) return;
    place();
    // 값이 있으면 그 달을 다시 펴 준다 (닫는 사이 달을 넘겨 뒀을 수 있다).
    if (value) {
      const d = parseValue(value);
      setView({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }
    // 막 열렸으니 격자로 포커스를 옮긴다.
    focusGridRef.current = true;
    setOpen(true);
  };

  // 바깥 클릭으로 닫고, 스크롤·리사이즈에는 따라 움직인다.
  // fixed로 띄웠기 때문에 폼이 스크롤되면 팝오버만 제자리에 남는다. 예전에는 그때 닫아 버렸는데,
  // 모달을 조금만 굴려도 달력이 사라져 Escape를 누른 것처럼 보였다. 이제는 다시 자리를 잡는다.
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
    // 캡처 단계로 듣는다 — 스크롤은 버블링하지 않는다.
    const onScroll = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      // 트리거가 화면 밖으로 완전히 밀려나면 따라갈 자리가 없다. 그때만 닫는다.
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpen(false);
        return;
      }
      place();
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
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDownCapture, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, close, place]);

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
  // disabled 버튼은 focus()를 받지 않는다. min 보정을 안 하면 지난 달이 섞인 달에서
  // 달력을 열어도 포커스가 아무 데도 안 들어가 화살표 키가 통째로 먹지 않는다.
  const monthCells = cells
    .filter((d) => d.getMonth() + 1 === view.month)
    .map(toLocalDateString);
  const focusTarget =
    value &&
    !isBlocked(value) &&
    cells.some((d) => toLocalDateString(d) === value)
      ? value
      : (monthCells.find((iso) => !isBlocked(iso)) ?? monthCells[0]);

  return (
    <div className={cn('relative', FIELD_WIDTH)}>
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
          FIELD_OUTLINED,
          'flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50',
          value ? 'text-gray-300' : 'text-gray-500',
        )}
      >
        {value ? formatDisplay(value) : 'YY. MM. DD.'}
        <ChevronDownIcon className="size-3 shrink-0 text-gray-500" />
      </button>

      {open && anchor && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="날짜 선택"
          style={{ top: anchor.top, left: anchor.left }}
          className="fixed z-50 w-[252px] rounded-lg border-[0.5px] border-gray-600 bg-gray-800 p-3 shadow-xl"
        >
          {/* 달 이동 */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label="이전 달"
              className="flex size-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-100"
            >
              <ChevronDownIcon className="size-3 rotate-90" />
            </button>
            <span
              aria-live="polite"
              className="text-[13px] leading-5 font-medium text-gray-100"
            >
              {view.year}년 {view.month}월
            </span>
            <button
              type="button"
              onClick={() => shift(1)}
              aria-label="다음 달"
              className="flex size-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-100"
            >
              <ChevronDownIcon className="size-3 -rotate-90" />
            </button>
          </div>

          {/* 요일 */}
          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((w) => (
              <span
                key={w}
                aria-hidden
                className="flex h-6 items-center justify-center text-[10px] leading-3 font-medium text-gray-500"
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
            className="grid grid-cols-7 gap-0.5"
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
                  onClick={() => select(date)}
                  disabled={blocked}
                  aria-pressed={selected}
                  aria-current={iso === today ? 'date' : undefined}
                  className={cn(
                    'flex h-7 items-center justify-center rounded-md text-[12px] leading-4 font-medium transition-colors',
                    blocked
                      ? 'cursor-not-allowed text-gray-700'
                      : selected
                        ? 'bg-secondary-400 text-gray-950'
                        : inMonth
                          ? 'text-gray-200 hover:bg-gray-700'
                          : 'text-gray-600 hover:bg-gray-700',
                    // 오늘은 고르지 않았을 때만 테두리로 표시한다(고르면 채움과 겹친다).
                    iso === today && !selected && 'ring-1 ring-gray-500',
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
