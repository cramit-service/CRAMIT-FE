// src/features/study/lib/printSummary.tsx
// 요약을 PDF로 저장한다 (#180). 학습 화면을 그대로 인쇄하면 분할 레이아웃이 따라오고
// 스크롤 칸에서 잘리므로, 요약 본문만 담은 숨긴 iframe을 만들어 브라우저 인쇄에 넘긴다.
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { MarkdownContent } from '@/features/study/components/viewer/MarkdownContent';

const FRAME_ID = 'summary-print-frame';

// 인쇄 틀 안에만 걸린다. 브라우저는 배경색을 빼고 인쇄해서, 코드 블록·표 머리 회색을 남기려면 exact가 필요하다.
const PRINT_CSS = `
@page {
  size: A4;
  margin: 18mm 16mm 20mm;
  @bottom-center { content: counter(page) " / " counter(pages); font-size: 9pt; }
}
body { margin: 0; background: var(--color-surface); print-color-adjust: exact; -webkit-print-color-adjust: exact; }
h1, h2, h3 { break-after: avoid; }
pre, blockquote, tr { break-inside: avoid; }
`;

function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

function PrintDocument({
  heading,
  markdown,
}: {
  heading: string;
  markdown: string;
}) {
  return (
    <>
      <header className="mb-6 border-b border-gray-100 pb-4">
        <p className="text-label font-medium text-gray-500">
          Cramit · AI 강의 요약
        </p>
        <h1 className="text-heading-sm mt-1 font-semibold text-gray-800">
          {heading}
        </h1>
        <p className="text-label mt-1 text-gray-500 tabular-nums">
          {formatDate(new Date())} 저장
        </p>
      </header>
      {/* 감싸야 본문 첫 제목의 first:mt-0이 산다 */}
      <div>
        <MarkdownContent markdown={markdown} />
      </div>
    </>
  );
}

/** 인쇄 창을 연다. 크롬에서는 창이 닫힐 때까지 돌아오지 않는다. */
export async function printSummary({
  title,
  heading,
  markdown,
}: {
  /** 저장될 PDF의 기본 파일 이름 */
  title: string;
  /** 첫 쪽 머리에 들어갈 강의명·주차 */
  heading: string;
  markdown: string;
}) {
  // 지난 인쇄 틀이 afterprint 없이 남았으면 치운다
  document.getElementById(FRAME_ID)?.remove();

  const frame = document.createElement('iframe');
  frame.id = FRAME_ID;
  frame.tabIndex = -1;
  frame.setAttribute('aria-hidden', 'true');
  // 크기가 0이어도 인쇄는 문서 전체를 쓴다
  frame.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);

  const win = frame.contentWindow;
  const doc = frame.contentDocument;
  if (!win || !doc) {
    frame.remove();
    throw new Error('인쇄 틀을 만들지 못했습니다');
  }

  doc.title = title;
  doc.documentElement.lang = 'ko';

  // 앱 스타일시트를 그대로 옮겨야 MarkdownContent의 토큰 클래스가 인쇄에서도 산다
  const loads = [
    ...document.querySelectorAll('link[rel="stylesheet"], style'),
  ].map((node) => {
    const copy = node.cloneNode(true) as HTMLElement;
    const loaded =
      copy.tagName === 'LINK'
        ? new Promise<void>((resolve) => {
            copy.onload = copy.onerror = () => resolve();
          })
        : Promise.resolve();
    doc.head.appendChild(copy);
    return loaded;
  });
  const printStyle = doc.createElement('style');
  printStyle.textContent = PRINT_CSS;
  doc.head.appendChild(printStyle);

  const container = doc.createElement('div');
  doc.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() =>
    root.render(<PrintDocument heading={heading} markdown={markdown} />),
  );

  await Promise.all(loads);
  await doc.fonts.ready;

  // PDF 기본 파일 이름을 어느 문서 제목에서 가져올지 브라우저마다 달라 바깥 제목도 잠시 맞춘다
  const pageTitle = document.title;
  document.title = title;
  win.addEventListener(
    'afterprint',
    () => {
      document.title = pageTitle;
      root.unmount();
      frame.remove();
    },
    { once: true },
  );
  win.focus();
  win.print();
}
