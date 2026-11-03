'use client';
// src/features/study/components/viewer/PdfPlaceholder.tsx
// PDF가 아직 안 그려졌을 때(로딩·실패·자료 없음) 깔리는 체크무늬와 큰 미리보기 틀.
import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { cn } from '@/shared/lib/cn';
import { PdfCanvas } from '@/features/study/components/viewer/PdfCanvas';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  formatZoom,
  type ZoomDirection,
} from '@/features/study/lib/zoom';
import { IconButton } from '@/shared/ui/IconButton';

// 트랙패드 핀치는 휠 이벤트를 잘게 쏟는다. 한 번 움직인 뒤 이만큼은 다음 단계를 받지 않는다.
const WHEEL_STEP_MS = 150;

// 색은 @theme 토큰 변수를 그대로 참조한다 (하드코딩 금지 규칙 준수).
// 체크무늬는 Tailwind 유틸로 표현할 수 없어 background-image로만 처리한다.
export function checkerStyle(size: number): React.CSSProperties {
  const half = size / 2;
  const square =
    'linear-gradient(45deg, var(--color-gray-200) 25%, transparent 25%, transparent 75%, var(--color-gray-200) 75%)';

  return {
    backgroundColor: 'var(--color-gray-100)',
    backgroundImage: `${square}, ${square}`,
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: `0 0, ${half}px ${half}px`,
  };
}

interface PdfPagePreviewProps {
  doc: PDFDocumentProxy | null;
  page: number;
  isLoading: boolean;
  failed: boolean;
  zoom: number;
  onZoom: (direction: ZoomDirection) => void;
}

// 우측 큰 미리보기 영역. 문서가 오기 전까지는 체크무늬가 자리를 잡고 있는다.
export function PdfPagePreview({
  doc,
  page,
  isLoading,
  failed,
  zoom,
  onZoom,
}: PdfPagePreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Ctrl(⌘)+휠로 키우고 줄인다. React의 onWheel은 passive라 브라우저 확대를 막지 못한다.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !doc) return;
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const now = performance.now();
      if (now - last < WHEEL_STEP_MS) return;
      last = now;
      onZoom(e.deltaY < 0 ? 1 : -1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [doc, onZoom]);

  return (
    <div
      ref={rootRef}
      className={cn(
        // relative 필수 — 배율 묶음이 absolute다 (CLAUDE.md 4-6).
        'relative flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-md',
        // 흰 판 위의 흰 종이는 ΔE 0이라 경계가 없다. 종이가 놓이는 자리를 well로 파서
        // 종이를 드러낸다 — 여긴 hover가 없으니 well이 바닥 노릇을 해도 걸리는 게 없다.
        doc && 'bg-well',
      )}
      style={doc ? undefined : checkerStyle(48)}
    >
      {doc ? (
        <>
          <PdfCanvas doc={doc} page={page} zoom={zoom} className="size-full" />
          {/* 배율 묶음 (#120 프리뷰 B안): 보는 대상 바로 위, 오른쪽 아래에 떠 있다. */}
          <div className="bg-surface shadow-near absolute right-4 bottom-4 z-10 flex items-center gap-0.5 rounded-md border border-gray-100 p-1">
            <IconButton
              name="minus"
              glyph={16}
              rank="plain"
              aria-label="축소"
              disabled={zoom <= MIN_ZOOM}
              onClick={() => onZoom(-1)}
            />
            <span
              aria-live="polite"
              className="text-label w-14 text-center font-medium text-gray-700 tabular-nums"
            >
              {formatZoom(zoom)}
            </span>
            <IconButton
              name="plus"
              glyph={16}
              rank="plain"
              aria-label="확대"
              disabled={zoom >= MAX_ZOOM}
              onClick={() => onZoom(1)}
            />
          </div>
        </>
      ) : (
        <p className="text-label text-gray-500">
          {failed
            ? '강의 자료를 불러오지 못했어요'
            : isLoading
              ? '강의 자료를 불러오는 중…'
              : '아직 올라온 강의 자료가 없어요'}
        </p>
      )}
    </div>
  );
}
