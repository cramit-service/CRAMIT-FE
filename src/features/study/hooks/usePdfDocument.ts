'use client';
// src/features/study/hooks/usePdfDocument.ts
import { useEffect, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { loadPdf, type PdfSource } from '@/features/study/lib/pdfjs';

interface Loaded {
  source: PdfSource | null;
  doc: PDFDocumentProxy | null;
  // 첫 페이지의 높이/폭. 썸네일 상자를 문서 비율에 맞추는 데 쓴다 —
  // 시안은 16:9 슬라이드지만 강의자료는 A4 세로가 그만큼 흔하다.
  ratio: number | null;
  failed: boolean;
}

// PDF 문서 하나를 열어 두는 훅. 큰 미리보기와 썸네일이 같은 문서를 나눠 쓴다 —
// 페이지마다 새로 여는 것보다 훨씬 싸고, 워커도 하나만 뜬다.
export function usePdfDocument(source: PdfSource | null) {
  const [loaded, setLoaded] = useState<Loaded>({
    source: null,
    doc: null,
    ratio: null,
    failed: false,
  });

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    const task = loadPdf(source);

    task.promise
      .then(async (doc) => {
        const first = await doc.getPage(1);
        const { width, height } = first.getViewport({ scale: 1 });
        if (!cancelled) {
          setLoaded({ source, doc, ratio: height / width, failed: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded({ source, doc: null, ratio: null, failed: true });
        }
      });

    // task를 없애면 딸린 문서와 워커도 같이 정리된다
    return () => {
      cancelled = true;
      void task.destroy();
    };
  }, [source]);

  // 소스가 바뀐 직후에는 아직 이전 문서가 state에 남아 있다. 그걸 그리면 한 프레임 동안
  // 엉뚱한 자료가 보이므로, 방금 요청한 소스의 결과일 때만 내보낸다.
  const settled = loaded.source === source;

  return {
    doc: settled ? loaded.doc : null,
    ratio: settled ? loaded.ratio : null,
    failed: settled && loaded.failed,
    isLoading: Boolean(source) && !settled,
  };
}
