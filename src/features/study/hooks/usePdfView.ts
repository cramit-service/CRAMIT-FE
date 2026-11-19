'use client';
// src/features/study/hooks/usePdfView.ts
import { useCallback, useState } from 'react';
import type { PdfSource } from '@/features/study/lib/pdfjs';
import { usePdfDocument } from '@/features/study/hooks/usePdfDocument';
import {
  MIN_ZOOM,
  stepZoom,
  type ZoomDirection,
} from '@/features/study/lib/zoom';

// 뷰어 화면이 쥐고 PDF 탭에 내려주는 문서·보기 상태. 탭 안에 두면 좁은 창에서
// 이분할이 풀려 탭이 내려갈 때 문서를 다시 받고 1쪽·맞춤으로 돌아간다.
export function usePdfView(source: PdfSource | null) {
  const pdf = usePdfDocument(source);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState<number>(MIN_ZOOM);
  // 목록은 켜고 끈다. 번호만 남기는 중간 상태는 두지 않는다 — 통째로 접는 편이 자리를 더 준다.
  const [listOpen, setListOpen] = useState(true);

  const zoomBy = useCallback(
    (direction: ZoomDirection) => setZoom((z) => stepZoom(z, direction)),
    [],
  );
  const toggleList = useCallback(() => setListOpen((open) => !open), []);

  return { ...pdf, page, setPage, zoom, zoomBy, listOpen, toggleList };
}

export type PdfView = ReturnType<typeof usePdfView>;
