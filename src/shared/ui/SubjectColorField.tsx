'use client';
// src/shared/ui/SubjectColorField.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { FIELD_TRIGGER } from '@/shared/ui/fieldStyle';
import { SUBJECT_COLORS, subjectDotClassOf } from '@/shared/lib/subjectColor';

interface SubjectColorFieldProps {
  id: string;
  /** 팔레트 번호(1부터). 목록을 아직 못 받아 기본값을 못 정했으면 null. */
  value: number | null;
  onChange: (index: number) => void;
  disabled?: boolean;
}

// 여덟 색을 4×2로 놓는다. 3×3이면 마지막 줄에 하나만 남아 판이 세로로 길어진다.
const COLUMNS = 4;

// 팔레트 번호 하나를 고르는 칸. 누르면 색 판이 열린다. 시안에 없는 UI라 2026-09-21
// 프리뷰로 정했다. 바깥 클릭·Escape·포커스 복귀는 DateField와 같은 규칙이다.
//
// features가 아니라 여기 있다. FIELD_TRIGGER를 쓰는 다섯 번째 칸이고(Combobox·DateField·
// TimeField·Select와 같은 트리거), 도메인은 모른다 — 번호와 «이미 쓰인 번호 집합»만 받는다.
// «어느 색이 쓰이고 있나»는 강의 목록을 불러와 색 지도를 만드는 쪽(LectureFormModal)이
// 알고, 그 결과만 taken으로 넘어온다. 팔레트 자체는 이미 shared/lib에 있다.
export function SubjectColorField({
  id,
  value,
  onChange,
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

  // 화살표로 칩 사이를 옮긴다. 4열 격자라 위아래는 4칸씩.
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
        className={cn(
          FIELD_TRIGGER,
          'flex w-auto items-center gap-2 whitespace-nowrap',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {/* 견본이 앞자리에 선다. dialog 트리거는 chevron을 달지 않는다(§4) — 아래로
            목록이 떨어지는 게 아니라 새 판이 열리므로 화살표가 설명하는 게 없다.
            날짜가 달력, 시간이 시계인 그 자리에 색은 색 자신이 온다.
            이름을 같이 적어서 보이는 값과 aria-label이 같은 말을 하게 한다 —
            점만 있으면 눈으로는 "무슨 색"을 부를 수 없다. */}
        <span
          aria-hidden
          className={cn(
            'size-4 shrink-0 rounded-full',
            subjectDotClassOf(value),
          )}
        />
        {currentName}
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="과목 색 고르기"
          // 칩 격자는 OPTION_LIST를 쓰지 않는다 — 그건 줄 목록의 명세다(§4 "they share
          // one list"). 판의 생김새만 같이 쓴다: 밝은 표면 + near 그림자, 테두리 없음.
          // 안쪽 제목도 뺐다. 네 개의 다른 목록판도 제목이 없고, 트리거가 바로 위에서
          // 현재 색을 보여 주고 있다 — dialog 이름은 aria-label이 갖는다.
          // w-max — absolute는 부모(트리거 폭)를 상한으로 줄어들어 칩이 겹친다.
          className="bg-surface shadow-near absolute top-full left-0 z-10 mt-1 w-max rounded-md p-3"
        >
          <div
            ref={gridRef}
            onKeyDown={handleGridKeyDown}
            // p-1 — 고른 칩의 링(ring-2 + offset-2)이 판 가장자리에서 잘리지 않게.
            className="grid grid-cols-4 gap-3 p-1"
          >
            {SUBJECT_COLORS.map((color, i) => {
              const index = i + 1;
              const selected = index === value;
              return (
                <button
                  key={color.dot}
                  type="button"
                  data-index={i}
                  tabIndex={index === focusIndex ? 0 : -1}
                  onClick={() => select(index)}
                  aria-pressed={selected}
                  aria-label={`${color.name}${selected ? ' · 선택됨' : ''}`}
                  className={cn(
                    'size-8 rounded-full outline-none',
                    color.dot,
                    // 링 색이 ring-white·ring-secondary-400이었다. 둘 다 토큰에 없어서
                    // 고른 색의 링도 포커스 링도 렌더되지 않았다 — 포커스는 §4가 유일하게
                    // "선택이 아니라 요구"라고 적은 항목이다(WCAG 2.4.7).
                    selected &&
                      'ring-offset-surface ring-2 ring-gray-800 ring-offset-2',
                    !selected &&
                      'focus-visible:ring-sky-ink focus-visible:ring-offset-surface focus-visible:ring-2 focus-visible:ring-offset-2',
                  )}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
