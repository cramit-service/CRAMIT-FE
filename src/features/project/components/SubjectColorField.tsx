'use client';
// src/features/project/components/SubjectColorField.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { ChevronDownIcon } from '@/shared/ui/FormModal';
import { SUBJECT_COLORS, subjectDotClassOf } from '@/shared/lib/subjectColor';

interface SubjectColorFieldProps {
  id: string;
  /** 팔레트 번호(1부터). 목록을 아직 못 받아 기본값을 못 정했으면 null. */
  value: number | null;
  onChange: (index: number) => void;
  /** 다른 과목이 쓰는 번호. 골라도 되지만 겹친다는 걸 알려 준다. */
  taken: ReadonlySet<number>;
  disabled?: boolean;
}

const COLUMNS = 3;

// 강의명 칸 왼쪽의 색 점. 누르면 팔레트 판이 열린다. 시안에 없는 UI라 2026-09-21 프리뷰로 정했다.
// 바깥 클릭·Escape·포커스 복귀는 ModalDateField와 같은 규칙이다.
export function SubjectColorField({
  id,
  value,
  onChange,
  taken,
  disabled,
}: SubjectColorFieldProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

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
    // 캡처 단계에서 받아야 모달이 통째로 닫히기 전에 판만 닫을 수 있다.
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

  // 막 열렸을 때 고른 칩으로 포커스를 옮긴다.
  useEffect(() => {
    if (!open) return;
    gridRef.current
      ?.querySelector<HTMLButtonElement>('[tabindex="0"]')
      ?.focus();
  }, [open]);

  const select = (index: number) => {
    onChange(index);
    close();
  };

  // 화살표로 칩 사이를 옮긴다. 3열 격자라 위아래는 3칸씩.
  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const step =
      e.key === 'ArrowLeft'
        ? -1
        : e.key === 'ArrowRight'
          ? 1
          : e.key === 'ArrowUp'
            ? -COLUMNS
            : e.key === 'ArrowDown'
              ? COLUMNS
              : 0;
    if (step === 0) return;
    e.preventDefault();

    const focused = document.activeElement as HTMLElement | null;
    const current = Number(focused?.dataset.index ?? -1);
    if (current < 0) return;
    const next = current + step;
    if (next < 0 || next >= SUBJECT_COLORS.length) return;
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-index="${next}"]`)
      ?.focus();
  };

  const currentName =
    value === null ? '정하는 중' : SUBJECT_COLORS[value - 1].name;
  // 포커스를 처음 받을 칩 — 고른 색, 없으면 첫 칩.
  const focusIndex = value ?? 1;

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`과목 색: ${currentName}`}
        className="focus:ring-secondary-400 flex h-14 w-19 items-center justify-center gap-2 rounded-md bg-gray-800 outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          aria-hidden
          className={cn('size-4.5 rounded-full', subjectDotClassOf(value))}
        />
        <ChevronDownIcon className="size-3 shrink-0 text-gray-500" />
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="과목 색 고르기"
          // w-max — absolute는 부모(트리거 폭)를 상한으로 줄어들어 칩이 겹친다.
          className="absolute top-16 left-0 z-10 w-max rounded-md border-[0.5px] border-gray-600 bg-gray-700 p-4 shadow-xl"
        >
          <p className="text-button-sm mb-3 text-gray-300">과목 색</p>
          <div
            ref={gridRef}
            onKeyDown={handleGridKeyDown}
            className="grid grid-cols-3 gap-4 p-1"
          >
            {SUBJECT_COLORS.map((color, i) => {
              const index = i + 1;
              const selected = index === value;
              const isTaken = !selected && taken.has(index);
              const state = selected
                ? ' · 선택됨'
                : isTaken
                  ? ' · 다른 과목이 쓰는 색'
                  : '';
              return (
                <button
                  key={color.dot}
                  type="button"
                  data-index={i}
                  tabIndex={index === focusIndex ? 0 : -1}
                  onClick={() => select(index)}
                  aria-pressed={selected}
                  aria-label={`${color.name}${state}`}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full outline-none',
                    color.dot,
                    selected &&
                      'ring-2 ring-white ring-offset-3 ring-offset-gray-700',
                    !selected &&
                      'focus-visible:ring-secondary-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-700',
                  )}
                >
                  {selected ? (
                    <CheckIcon className="size-4 text-gray-950" />
                  ) : isTaken ? (
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full bg-gray-900/55"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}
