'use client';
// src/features/study/lib/pdfjs.ts
// pdf.js 로더. 워커와 런타임 에셋 경로를 한곳에서 잡는다.
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentLoadingTask,
} from 'pdfjs-dist';

// URL이 오면 pdf.js가 직접 받아 오고, 바이트가 오면 그대로 넘긴다.
// 나중에 인증이 걸린 PDF를 apiClient로 받아 넘겨야 할 수 있어 둘 다 받아 둔다.
export type PdfSource = string | ArrayBuffer;

let configured = false;

// 모듈 최상단에서 잡으면 클라이언트 컴포넌트의 SSR 단계에서도 실행된다. 첫 로드 때 한 번만 한다.
function configureWorker() {
  if (configured) return;
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
  configured = true;
}

export function loadPdf(source: PdfSource): PDFDocumentLoadingTask {
  configureWorker();
  return getDocument({
    ...(typeof source === 'string' ? { url: source } : { data: source }),
    // 한글 강의자료는 CID 폰트를 쓰는 경우가 많다. CMap이 없으면 글자가 통째로 빈다.
    cMapUrl: '/pdfjs/cmaps/',
    cMapPacked: true,
    // 폰트를 임베드하지 않은 PDF(base14)는 이 데이터가 있어야 글자가 그려진다.
    standardFontDataUrl: '/pdfjs/standard_fonts/',
  });
}
