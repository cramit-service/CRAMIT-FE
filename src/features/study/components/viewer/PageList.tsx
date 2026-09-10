'use client';
// src/features/study/components/viewer/PageList.tsx
import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { cn } from '@/shared/lib/cn';
import { checkerStyle } from '@/features/study/components/viewer/PdfPlaceholder';
import { PdfThumbnail } from '@/features/study/components/viewer/PdfThumbnail';

// 좌측 목록 폭 한계
export const LIST_MIN_WIDTH = 36;
export const LIST_MAX_WIDTH = 160;

// 이 폭 아래로 줄이면 썸네일 대신 페이지 번호(P.01)만 보여준다 (Figma 1-4655 상태)
const NUMBER_MODE_WIDTH = 72;

// 썸네일 세로/가로 비. 문서를 열기 전까지 쓰는 값이다 (Figma 96.564 / 172.136).
// 문서가 오면 첫 페이지 비율로 갈아탄다 — 강의자료는 A4 세로도 흔하다.
const THUMBNAIL_RATIO = 0.561;

interface PageListProps {
  // 썸네일도 큰 미리보기와 같은 문서에서 뽑는다
  doc: PDFDocumentProxy | null;
  // 첫 페이지의 높이/폭. 없으면 시안 비율로 그린다.
  ratio: number | null;
  pageCount: number;
  currentPage: number;
  onSelect: (page: number) => void;
  width: number; // 드래그 핸들로 조절되는 목록 폭
}

// 목록 아래쪽이 패널 배경(gray-900)으로 자연스럽게 사라지는 Figma의 페이드.
// 그라데이션은 유틸 클래스로 토큰을 못 써서 background-image로 처리한다.
const fadeStyle: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to bottom, transparent, var(--color-gray-900))',
};

export function PageList({
  doc,
  ratio,
  pageCount,
  currentPage,
  onSelect,
  width,
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
  // 체크무늬는 자리표시다. 페이지가 그려지면 종이 뒤로 무늬가 비쳐 보인다.
  const thumbnailBackground: React.CSSProperties = doc
    ? { backgroundColor: 'var(--color-gray-100)' }
    : checkerStyle(12);
  const isNumberMode = width < NUMBER_MODE_WIDTH;
  const thumbnailHeight = Math.round(width * (ratio ?? THUMBNAIL_RATIO));

  return (
    <div className="relative shrink-0" style={{ width }}>
      <ul
        ref={listRef}
        className={cn(
          // offsetTop이 목록 기준이 되도록 — 스크롤 위치 계산이 여기에 기댄다
          'relative',
          // 60~80장짜리 강의자료는 썸을 끌어 한 번에 훑어야 한다. 시안엔 없지만
          // 페이드만으로는 그 긴 목록을 지날 방법이 없다(드래그 핸들을 걷어내 자리가 났다).
          'scrollbar-dark h-full overflow-y-auto pr-1',
          isNumberMode ? 'space-y-1.5' : 'space-y-3.5',
        )}
      >
        {pages.map((page) =>
          isNumberMode ? (
            <li key={page} ref={page === currentPage ? currentRef : undefined}>
              <button
                type="button"
                onClick={() => onSelect(page)}
                aria-current={page === currentPage ? 'true' : undefined}
                className={cn(
                  'text-button-sm flex h-[34px] w-full items-center justify-center rounded-sm font-medium text-gray-900 transition-colors',
                  page === currentPage
                    ? // 현재 페이지만 연두. 나머지는 중립이라 지금 위치가 더 또렷하다.
                      'border-primary-500 bg-primary-400 border-2'
                    : 'border-2 border-transparent bg-gray-200 hover:bg-gray-300',
                )}
              >
                {page}
              </button>
            </li>
          ) : (
            <li key={page} ref={page === currentPage ? currentRef : undefined}>
              <button
                type="button"
                onClick={() => onSelect(page)}
                aria-current={page === currentPage ? 'true' : undefined}
                className={cn(
                  'relative block w-full overflow-hidden rounded-md transition-colors',
                  page === currentPage
                    ? 'border-primary-500 border-2'
                    : 'hover:border-secondary-300 border-2 border-transparent',
                )}
                style={{ ...thumbnailBackground, height: thumbnailHeight }}
              >
                <PdfThumbnail doc={doc} page={page} />
                {/* 페이지 번호 배지 (Figma: 썸네일 좌상단에 겹쳐 놓임) */}
                <span
                  className={cn(
                    'text-label absolute top-1.5 left-1 rounded-sm px-1.5 py-px',
                    // 연두 위에 흰 글자를 얹으면 1.13:1이라 글자색도 상태별로 갈린다
                    page === currentPage
                      ? 'bg-primary-400 text-gray-950'
                      : 'bg-gray-800 text-white',
                  )}
                >
                  P.{String(page).padStart(2, '0')}
                </span>
                <span className="sr-only">{page}페이지 미리보기</span>
              </button>
            </li>
          ),
        )}
      </ul>

      {/* 하단 페이드 (스크롤 여지 암시) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
        style={fadeStyle}
      />
    </div>
  );
}
