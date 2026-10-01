'use client';
// src/features/study/components/viewer/PdfThumbnail.tsx
import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PdfCanvas } from '@/features/study/components/viewer/PdfCanvas';

// 목록에 들어온 것만 그린다. 강의자료는 수십 장이 흔한데 전부 미리 그리면
// 워커가 그동안 막혀 큰 미리보기까지 늦어진다.
export function PdfThumbnail({
  doc,
  page,
}: {
  doc: PDFDocumentProxy | null;
  page: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 한 번 보인 페이지는 계속 남겨 둔다 — 스크롤을 오르내릴 때마다 다시 그리면
        // 썸네일이 매번 깜빡인다.
        if (entry.isIntersecting) setSeen(true);
      },
      // 목록은 자기 상자 안에서 스크롤한다. 조금 미리 그려 두면 스크롤이 매끄럽다.
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen]);

  return (
    <span ref={ref} className="absolute inset-0 block">
      {seen && doc && <PdfCanvas doc={doc} page={page} className="size-full" />}
    </span>
  );
}
