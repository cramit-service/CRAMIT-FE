'use client';
// src/features/study/components/viewer/PdfCanvas.tsx
import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { cn } from '@/shared/lib/cn';

interface PdfCanvasProps {
  doc: PDFDocumentProxy | null;
  page: number;
  className?: string;
  // 맞춤(1)에 곱하는 배율. 1보다 크면 상자 안에서 스크롤한다.
  zoom?: number;
}

// PDF 한 페이지를 부모 상자에 맞춰 그린다. 크기는 부모가 정하고 여기서는 재기만 한다 —
// 큰 미리보기(리사이저로 폭이 변함)와 썸네일이 같은 컴포넌트를 쓴다.
export function PdfCanvas({ doc, page, className, zoom = 1 }: PdfCanvasProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  // 직전에 그린 배율·페이지. 배율이 바뀌면 보던 가운데를 지키고, 페이지가 바뀌면 맨 위로 간다.
  const drawn = useRef({ zoom, page });
  // 실패를 페이지 번호로 들고 있으면 다른 페이지로 넘어갈 때 저절로 풀린다 —
  // 이펙트 첫머리에서 상태를 되돌리지 않아도 된다.
  const [failedPage, setFailedPage] = useState<number | null>(null);
  const failed = failedPage === page;

  // 부모 폭이 바뀌면 다시 그려야 한다. 리사이저가 드래그 중에는 매 프레임 들어온다.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!doc || !canvas || box.width < 1 || box.height < 1) return;
    if (page < 1 || page > doc.numPages) return;

    let cancelled = false;
    let task: RenderTask | null = null;

    doc.getPage(page).then(
      (pdfPage) => {
        if (cancelled) return;
        const base = pdfPage.getViewport({ scale: 1 });
        const scale =
          Math.min(box.width / base.width, box.height / base.height) * zoom;
        // 캔버스 픽셀은 화면 배율만큼 키우고 CSS 크기는 그대로 둬야 글자가 안 뭉갠다
        const ratio = window.devicePixelRatio || 1;
        const viewport = pdfPage.getViewport({ scale: scale * ratio });

        // 캔버스 픽셀 수는 정수여야 하지만 CSS 크기는 소수점을 살린다.
        // 여기서 반올림하면 상자와 페이지의 비가 미세하게 어긋나 가장자리에 배경이 1px 샌다.
        // 크기를 바꾸기 전에, 상자 가운데가 종이의 어디(비율)였는지 잰다.
        const el = boxRef.current;
        const center = el && {
          x:
            (el.scrollLeft + el.clientWidth / 2 - canvas.offsetLeft) /
            (canvas.offsetWidth || 1),
          y:
            (el.scrollTop + el.clientHeight / 2 - canvas.offsetTop) /
            (canvas.offsetHeight || 1),
        };

        canvas.width = Math.max(1, Math.round(viewport.width));
        canvas.height = Math.max(1, Math.round(viewport.height));
        canvas.style.width = `${base.width * scale}px`;
        canvas.style.height = `${base.height * scale}px`;

        if (el && center) {
          if (drawn.current.page !== page) {
            el.scrollTop = 0;
            el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
          } else if (drawn.current.zoom !== zoom) {
            el.scrollLeft =
              canvas.offsetLeft +
              center.x * canvas.offsetWidth -
              el.clientWidth / 2;
            el.scrollTop =
              canvas.offsetTop +
              center.y * canvas.offsetHeight -
              el.clientHeight / 2;
          }
        }
        drawn.current = { zoom, page };

        task = pdfPage.render({ canvas, viewport });
        task.promise.catch((error: { name?: string }) => {
          // 다시 그리기 전에 취소하는 건 정상 흐름이다. 그 외는 빈 캔버스로 두지 않는다.
          if (cancelled || error?.name === 'RenderingCancelledException')
            return;
          setFailedPage(page);
        });
      },
      () => {
        if (!cancelled) setFailedPage(page);
      },
    );

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, page, box.width, box.height, zoom]);

  const zoomed = zoom > 1;

  return (
    <div
      ref={boxRef}
      className={cn(
        'relative flex min-h-0 min-w-0',
        // 확대하면 넘치는 쪽으로만 스크롤한다. 가운데 정렬은 m-auto가 맡는다 —
        // items-center로 두면 넘친 위·왼쪽이 스크롤로도 닿지 않는 곳에 잘린다.
        zoomed ? 'overflow-auto' : 'items-center justify-center',
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          zoomed ? 'm-auto shrink-0' : 'max-h-full max-w-full',
          failed && 'invisible',
        )}
      />
      {failed && (
        <p className="text-label absolute text-gray-500">
          이 페이지를 그리지 못했어요
        </p>
      )}
    </div>
  );
}
