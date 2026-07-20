// src/features/study/components/viewer/PdfPlaceholder.tsx
// 실제 PDF 렌더 전 자리표시용 체크무늬.
// TODO(PDF): 백엔드에서 pdfUrl을 받으면 react-pdf 등으로 실제 페이지를 렌더한다.

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

// 우측 큰 미리보기 영역
export function PdfPagePreview({ page }: { page: number }) {
  return (
    <div
      className="flex min-w-0 flex-1 items-center justify-center rounded-md"
      style={checkerStyle(48)}
    >
      <p className="text-[11px] leading-[17px] tracking-[-0.22px] text-gray-950">
        PDF 미리보기 - {page}페이지
      </p>
    </div>
  );
}
