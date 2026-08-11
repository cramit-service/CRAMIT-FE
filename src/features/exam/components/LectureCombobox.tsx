'use client';
// src/features/exam/components/LectureCombobox.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';
// 강의 목록은 학습하기 화면(study)이 이미 조회한다. 같은 GET을 두 번 정의하지 않고
// 그 훅을 그대로 쓴다 — 쿼리 키도 공유돼 캐시가 한 벌로 유지된다.
import { useProjectSummaries } from '@/features/study/hooks/useProjectSummaries';
import { FIELD_FILLED, HINT } from './fieldStyles';

interface LectureComboboxProps {
  id: string;
  /** 고른 강의의 projectId. 아직 안 골랐으면 ''. */
  value: string;
  onChange: (projectId: string) => void;
  disabled?: boolean;
}

// 강의 선택 콤보박스. 입력창에 치면 내 강의 목록이 좁혀지고, 목록에서 고른 것만 값이 된다.
// 자유 입력을 그대로 받지 않는 이유: Exam.projectId는 필수인데 글자만으로는 채울 수 없고,
// 비면 홈 학습 배너의 강의 이동이 깨진다.
export function LectureCombobox({
  id,
  value,
  onChange,
  disabled,
}: LectureComboboxProps) {
  const { data: lectures, isPending, isError } = useProjectSummaries();
  // 사용자가 직접 친 글자. null은 "빈칸"이 아니라 "손대지 않았다"는 뜻이다.
  // 표시 글자를 state로 들고 있으면 수정 모드에서 빈칸으로 열린다 — value(projectId)는
  // 처음부터 있어도 강의 목록이 나중에 와서, 여는 시점엔 그 id의 제목을 알 수 없다.
  const [draft, setDraft] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const listId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;

  // 공유받은 강의도 시험을 볼 수 있으니 거르지 않는다.
  // (주차 업로드는 내 강의에만 가능해서 sharedBy로 걸렀지만, 시험은 그 제약이 없다)
  const all = useMemo(() => lectures ?? [], [lectures]);
  const selected = all.find((l) => l.projectId === value) ?? null;
  const selectedTitle = selected?.title ?? '';
  // 파생값이라 목록이 늦게 와도 도착하는 순간 고른 강의 제목이 채워진다.
  const query = draft ?? selectedTitle;

  const options = useMemo(() => {
    const keyword = draft?.trim().toLowerCase() ?? '';
    // 손대지 않았으면 고른 제목이 보이는 상태다. 그걸 필터로 쓰면 결과가
    // 자기 자신 하나로 줄어 다른 강의로 바꿀 수가 없다.
    if (!keyword) return all;
    return all.filter((l) => l.title.toLowerCase().includes(keyword));
  }, [all, draft]);

  // 목록이 줄면 저장된 인덱스가 범위 밖일 수 있다. effect로 되돌리지 않고 읽을 때 자른다 —
  // 렌더가 한 번으로 끝나고, 범위를 벗어난 값이 화면에 잠깐 비치지도 않는다.
  const active = activeIndex < options.length ? activeIndex : 0;

  // 하이라이트가 보이는 영역 밖으로 나가면 따라 스크롤한다.
  // 없으면 아래 화살표를 누를 때 하이라이트가 목록 밑으로 사라져 어디 있는지 알 수 없다.
  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${id}-option-${active}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id]);

  const closeAndRestore = () => {
    setOpen(false);
    // 고르다 만 글자가 남아 있으면 고른 것처럼 보인다. 실제 값에 맞춰 되돌린다.
    setDraft(null);
  };

  // 바깥을 눌러도 닫는다. click이 아니라 mousedown인 이유는 Modal의 배경 닫기와 같다 —
  // 목록 안에서 눌러 바깥에서 떼는 드래그로는 닫히면 안 된다.
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      setDraft(null);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const select = (projectId: string) => {
    onChange(projectId);
    setDraft(null);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); // 커서가 글자 끝으로 튀는 기본 동작을 막는다
      if (!open) {
        setOpen(true);
        return;
      }
      if (options.length === 0) return;
      setActiveIndex(
        e.key === 'ArrowDown'
          ? (active + 1) % options.length
          : (active - 1 + options.length) % options.length,
      );
      return;
    }

    if (e.key === 'Enter') {
      if (!open) return;
      // 목록이 열려 있는 동안 Enter는 "고르기"다. 결과가 없을 때도 막아야 한다 —
      // 안 그러면 일치하는 강의가 없을 때 Enter에 모달 form이 그대로 제출된다.
      e.preventDefault();
      if (options.length === 0) return;
      select(options[active].projectId);
      return;
    }

    if (e.key === 'Escape' && open) {
      // Modal은 window에서 Escape를 듣고 있다. 여기서 멈추지 않으면
      // 목록만 닫으려던 Escape에 모달까지 닫혀 입력이 통째로 날아간다.
      e.stopPropagation();
      closeAndRestore();
    }
  };

  return (
    // 목록이 absolute다. relative 기준이 없으면 문서 최상위를 기준으로 잡아
    // 모달 밖 엉뚱한 자리에 뜬다. (CLAUDE.md 4-5)
    <div ref={wrapperRef} className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && options.length > 0 ? optionId(active) : undefined
        }
        // 브라우저 자동완성이 목록 위에 겹쳐 뜨는 걸 막는다.
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setDraft(e.target.value);
          setOpen(true);
          // 글자를 고치는 순간 앞서 고른 강의는 더 이상 그 글자가 아니다.
          if (value) onChange('');
        }}
        onFocus={() => setOpen(true)}
        // 이미 포커스가 있는 입력창을 다시 눌러도 onFocus는 오지 않는다. 고르거나 Esc로
        // 닫은 뒤 다시 열려면 이게 필요하다. click은 항목 선택 뒤에 와서 방금 닫은 목록을
        // 도로 열어버리므로 mousedown으로 받는다.
        onMouseDown={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="강의 명을 입력해 주세요."
        disabled={disabled}
        className={cn(FIELD_FILLED, 'w-full pr-10')}
      />
      {/* 장식이다. pointer-events-none이라 여기를 눌러도 클릭이 입력창으로 내려가 목록이 열린다. */}
      <Icon
        name="arrow-down"
        size={12}
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400"
      />

      {open && (
        <ul
          id={listId}
          role="listbox"
          // 어두운 패널 위 목록. 스크롤바도 어둡게 맞춘다(모달 본문과 같은 이유).
          className="scrollbar-dark absolute top-11 right-0 left-0 z-10 max-h-40 overflow-y-auto rounded-md border-[0.5px] border-gray-600 bg-gray-800 py-1 scheme-dark"
        >
          {isPending ? (
            <li className={cn(HINT, 'px-3.5 py-2 text-gray-500')}>
              강의 목록을 불러오는 중이에요.
            </li>
          ) : isError ? (
            <li className={cn(HINT, 'text-error px-3.5 py-2')}>
              강의 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </li>
          ) : options.length === 0 ? (
            <li className={cn(HINT, 'px-3.5 py-2 text-gray-500')}>
              {all.length === 0
                ? '등록된 강의가 없어요.'
                : '일치하는 강의가 없어요.'}
            </li>
          ) : (
            options.map((lecture, index) => (
              <li
                key={lecture.projectId}
                id={optionId(index)}
                role="option"
                aria-selected={lecture.projectId === value}
                // click은 input의 blur 뒤에 온다. mousedown으로 받아야 목록이 닫히기 전에 잡힌다.
                onMouseDown={(e) => {
                  e.preventDefault(); // 포커스가 입력창에서 떠나지 않게
                  select(lecture.projectId);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'cursor-pointer truncate px-3.5 py-2 text-[13px] leading-5 font-medium tracking-[-0.26px]',
                  index === active
                    ? 'bg-gray-700 text-gray-100'
                    : 'text-gray-300',
                )}
              >
                {lecture.title}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
