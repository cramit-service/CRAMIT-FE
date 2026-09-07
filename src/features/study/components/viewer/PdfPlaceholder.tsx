// src/features/study/components/viewer/PdfPlaceholder.tsx
// PDF가 아직 안 그려졌을 때(로딩·실패·자료 없음) 깔리는 체크무늬와 큰 미리보기 틀.
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { cn } from '@/shared/lib/cn';
import { PdfCanvas } from '@/features/study/components/viewer/PdfCanvas';

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
}

// 우측 큰 미리보기 영역. 문서가 오기 전까지는 체크무늬가 자리를 잡고 있는다.
export function PdfPagePreview({
  doc,
  page,
  isLoading,
  failed,
}: PdfPagePreviewProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-md',
        // 페이지가 그려지면 남는 좌우 여백은 패널 색 그대로 둔다.
        // 체크무늬를 깔아 두면 종이 옆에 무늬가 붙어 보인다.
        doc && 'bg-gray-950/40',
      )}
      style={doc ? undefined : checkerStyle(48)}
    >
      {doc ? (
        <PdfCanvas doc={doc} page={page} className="size-full" />
      ) : (
        <p className="text-label text-gray-950">
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
