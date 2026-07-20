'use client';
// src/features/study/components/viewer/PageList.tsx
import { cn } from '@/shared/lib/cn';
import { checkerStyle } from './PdfPlaceholder';

// 좌측 목록 폭 한계 (Figma: 썸네일 172px / 번호 레일 48px을 약 0.72배로 축소한 값)
export const LIST_MIN_WIDTH = 36;
export const LIST_MAX_WIDTH = 160;
export const LIST_DEFAULT_WIDTH = 124;

// 이 폭 아래로 줄이면 썸네일 대신 페이지 번호(P.01)만 보여준다 (Figma 1-4655 상태)
const NUMBER_MODE_WIDTH = 72;

// 썸네일 세로/가로 비 (Figma 96.564 / 172.136)
const THUMBNAIL_RATIO = 0.561;

interface PageListProps {
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
  pageCount,
  currentPage,
  onSelect,
  width,
}: PageListProps) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const isNumberMode = width < NUMBER_MODE_WIDTH;
  const thumbnailHeight = Math.round(width * THUMBNAIL_RATIO);

  return (
    <div className="relative shrink-0" style={{ width }}>
      <ul
        className={cn(
          // 스크롤바는 숨긴다 — Figma엔 없고, 바로 옆 드래그 핸들과 겹쳐 보인다.
          // 더 볼 내용이 있다는 신호는 아래쪽 페이드가 대신한다.
          'h-full [scrollbar-width:none] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden',
          isNumberMode ? 'space-y-1.5' : 'space-y-3.5',
        )}
      >
        {pages.map((page) =>
          isNumberMode ? (
            <li key={page}>
              <button
                type="button"
                onClick={() => onSelect(page)}
                aria-current={page === currentPage ? 'true' : undefined}
                className={cn(
                  'flex h-[34px] w-full items-center justify-center rounded-sm text-[12px] leading-[20px] font-medium tracking-[-0.24px] text-gray-900 transition-colors',
                  page === currentPage
                    ? 'border-secondary-600 bg-secondary-400 border-2'
                    : 'bg-secondary-100 hover:bg-secondary-200 border-2 border-transparent',
                )}
              >
                {page}
              </button>
            </li>
          ) : (
            <li key={page}>
              <button
                type="button"
                onClick={() => onSelect(page)}
                aria-current={page === currentPage ? 'true' : undefined}
                className={cn(
                  'relative block w-full overflow-hidden rounded-md transition-colors',
                  page === currentPage
                    ? 'border-secondary-600 border-2'
                    : 'hover:border-secondary-300 border-2 border-transparent',
                )}
                style={{ ...checkerStyle(12), height: thumbnailHeight }}
              >
                {/* 페이지 번호 배지 (Figma: 썸네일 좌상단에 겹쳐 놓임) */}
                <span
                  className={cn(
                    'absolute top-1.5 left-1 rounded-sm px-1.5 py-px text-[10px] leading-[14px] tracking-[-0.2px] text-white',
                    page === currentPage ? 'bg-secondary-400' : 'bg-gray-800',
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
