'use client';
// src/features/study/components/viewer/PageListToggle.tsx
import { cn } from '@/shared/lib/cn';

// 페이지 목록 폭을 최소 ↔ 최대로 한 번에 바꾼다.
// 드래그로 폭을 잇는 대신 두 상태만 두는 이유는, 목록이 이미 폭 72를 경계로
// 썸네일 모드 / 번호 모드 둘로만 갈리기 때문이다 — 그 사이 값들은 서로 구분되지 않는다.
// 드래그를 걷어낸 자리는 목록 스크롤바가 쓴다.
export function PageListToggle({
  wide,
  onToggle,
}: {
  wide: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative flex w-3 shrink-0 items-center justify-center">
      {/* 목록과 미리보기를 가르는 선 (드래그 핸들이 있던 자리) */}
      <span className="absolute inset-y-0 w-px bg-gray-800" />
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={wide}
        title={wide ? '페이지 목록 줄이기' : '페이지 목록 넓히기'}
        aria-label={wide ? '페이지 목록 줄이기' : '페이지 목록 넓히기'}
        className={cn(
          'focus-visible:ring-secondary-400 relative flex size-5 items-center justify-center rounded-full',
          'border border-gray-700 bg-gray-800 text-gray-300 transition-colors',
          'hover:bg-gray-700 hover:text-white focus-visible:ring-2 focus-visible:outline-none',
        )}
      >
        {/* 좌우 12px 거터보다 버튼이 커서 양쪽으로 걸친다 — 선 위에 놓이게 하려는 의도다 */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="size-3"
        >
          <path d={wide ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
        </svg>
      </button>
    </div>
  );
}
