'use client';
// src/features/study/components/Pagination.tsx
import { cn } from '@/shared/lib/cn';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PaginationProps {
  currentPage: number; // 1-based
  totalPages: number;
  onPageChange: (page: number) => void;
}

// 페이지가 많으면 앞/뒤 일부 + 말줄임(…)으로 축약한다. (예: 1 2 4 … 40)
function getPageItems(current: number, total: number): (number | '…')[] {
  const range = (s: number, e: number) =>
    Array.from({ length: e - s + 1 }, (_, i) => s + i);

  if (total <= 7) return range(1, total);

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  const items: (number | '…')[] = [1];
  if (left > 2) items.push('…');
  items.push(...range(left, right));
  if (right < total - 1) items.push('…');
  items.push(total);
  return items;
}

// 숫자 페이지 버튼(Figma: 0.5px 테두리 pill).
// 현재 페이지 = #2b2e36(gray-800) 배경 + secondary-400 테두리 + 흰 글자.
// 비활성 = 흰 배경 + gray-300 테두리 + gray-700 글자.
function PageButton({
  active = false,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-button-sm flex size-8 items-center justify-center rounded-md border-[0.5px] font-medium transition-colors',
        active
          ? 'border-secondary-400 bg-gray-800 text-white'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
      )}
    >
      {children}
    </button>
  );
}

// 이전/다음 화살표(Figma: 테두리 없는 아이콘).
function ArrowButton({
  disabled = false,
  onClick,
  ariaLabel,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'flex size-6 items-center justify-center rounded-md transition-colors',
        disabled
          ? 'cursor-not-allowed text-gray-300'
          : 'text-gray-600 hover:bg-gray-100',
      )}
    >
      {children}
    </button>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = getPageItems(currentPage, totalPages);

  return (
    <nav
      className="flex items-center justify-end gap-2"
      aria-label="페이지네이션"
    >
      {/* disabled가 === 비교라 범위 밖 값이 들어오면 화살표가 살아있다.
          핸들러에서도 잘라 1..totalPages를 벗어나지 않게 한다. */}
      <ArrowButton
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        ariaLabel="이전 페이지"
      >
        <ChevronLeftIcon className="size-3.5" />
      </ArrowButton>

      {items.map((item, i) =>
        item === '…' ? (
          <span key={`ellipsis-${i}`} className="text-xs text-gray-950">
            …
          </span>
        ) : (
          <PageButton
            key={item}
            active={item === currentPage}
            onClick={() => onPageChange(item)}
          >
            {item}
          </PageButton>
        ),
      )}

      <ArrowButton
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        ariaLabel="다음 페이지"
      >
        <ChevronRightIcon className="size-3.5" />
      </ArrowButton>
    </nav>
  );
}
