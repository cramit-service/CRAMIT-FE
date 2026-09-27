'use client';
// src/shared/ui/PageList.tsx
// 번호가 매겨진 것들 중 하나를 고르는 세로 목록. 지금은 PDF 페이지가 쓰지만
// 이 부품은 PDF를 모른다 — 미리보기 한 칸을 어떻게 그릴지는 넣는 쪽이 정한다
// (CLAUDE.md 3절).
//
// 4절의 "선택은 무리를 아는 쪽이 그린다"가 여기서 지켜진다. 무리를 아는 쪽이
// 이 부품이므로, 고른 것을 표시하는 일도 여기 있다.
import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';

/** 목록 폭. 이보다 좁으면 미리보기가 무엇인지 알아볼 수 없고, 넓으면 본 화면이 좁아진다. */
export const LIST_WIDTH = 160;

interface PageListProps {
  pageCount: number;
  currentPage: number;
  onSelect: (page: number) => void;
  /** 목록 폭. 이 값이 번호 모드로 넘어갈지도 정한다. */
  width: number;
  /** 미리보기 한 칸. 폭이 좁으면 부르지 않는다. */
  renderPreview?: (page: number) => React.ReactNode;
  /** 미리보기 칸의 높이 = 폭 × 이 값. */
  previewRatio?: number;
  /** 미리보기가 아직 없을 때 깔아 둘 자리표시. */
  previewPlaceholder?: React.CSSProperties;
}

export function PageList({
  pageCount,
  currentPage,
  onSelect,
  width,
  renderPreview,
  previewRatio = 0.561,
  previewPlaceholder,
}: PageListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const currentRef = useRef<HTMLLIElement>(null);

  // 방향키로 넘긴 페이지가 목록 밖이면 어디로 갔는지 알 수 없다.
  // scrollIntoView는 바깥 스크롤까지 같이 움직여 화면이 튀므로 목록만 직접 민다.
  useEffect(() => {
    const list = listRef.current;
    const item = currentRef.current;
    if (!list || !item) return;
    const top = item.offsetTop;
    const bottom = top + item.offsetHeight;
    if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [currentPage]);

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  // 자릿수는 총 쪽수에서 나온다. 늘 두 자리로 채우면 아홉 쪽짜리 자료가 P.01이 되고,
  // 백 쪽이 넘으면 배지 폭이 중간에 달라진다. 총 쪽수에 맞추면 전부 같은 폭이 된다.
  const digits = String(pageCount).length;
  const previewHeight = Math.round(width * previewRatio);

  return (
    <div className="shrink-0" style={{ width }}>
      <ul
        ref={listRef}
        className={cn(
          // offsetTop이 목록 기준이 되도록 — 스크롤 위치 계산이 여기에 기댄다
          'relative',
          // 60~80장짜리 강의자료는 목록을 끌어 한 번에 훑어야 한다.
          'scrollbar-slim fade-bottom h-full overflow-y-auto pr-1',
          'space-y-3.5',
        )}
      >
        {pages.map((page) => {
          const current = page === currentPage;
          return (
            <li key={page} ref={current ? currentRef : undefined}>
              <button
                type="button"
                onClick={() => onSelect(page)}
                aria-current={current ? 'true' : undefined}
                className={cn(
                  'text-label relative block w-full overflow-hidden rounded-md font-medium',
                  'transition-colors duration-150 ease-out',
                  'focus-visible:ring-sky-ink focus-visible:ring-2 focus-visible:outline-none',
                  // 고른 것만 연두다. 그림이 채움을 덮으므로 연두가 테두리로 나온다 —
                  // 채울 자리가 없을 때 연두가 설 수 있는 유일한 자리다.
                  current
                    ? 'outline-lime-action outline-2'
                    : 'outline-1 outline-transparent hover:outline-gray-100',
                )}
                style={{ ...previewPlaceholder, height: previewHeight }}
              >
                {renderPreview?.(page)}
                {/* 번호 배지. 미리보기 위에 겹치므로 자기 채움을 갖는다.
                    미리보기가 대개 흰 종이라 쉬는 배지는 테두리로 자기 자리를 낸다. */}
                <span
                  className={cn(
                    'text-label absolute top-1.5 left-1 rounded-md px-1.5 py-px',
                    current
                      ? 'bg-lime-action text-gray-800'
                      : 'bg-surface border border-gray-100 text-gray-700',
                  )}
                >
                  P.{String(page).padStart(digits, '0')}
                </span>
                <span className="sr-only">{page}페이지 미리보기</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
