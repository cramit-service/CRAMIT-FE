// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/shared/lib/QueryProvider';
import { SPLASH_READ_SCRIPT } from '@/features/landing/lib/splashScript';

export const metadata: Metadata = {
  title: 'Cramit',
  description: 'AI 기반 스마트 학습 어시스턴트',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 스플래시 스킵 스크립트가 하이드레이션 전에 data-splash를 찍는다.
    // 서버 HTML에는 없는 속성이라 경고가 나므로 html 요소에만 예외를 둔다(다크모드 스크립트와 같은 방식).
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 스플래시를 이미 본 세션인지 첫 페인트 전에 판정한다. 읽기만 하므로
            모든 라우트에서 돌아도 부작용이 없다. 자세한 이유는 splashScript.ts 참고. */}
        <script dangerouslySetInnerHTML={{ __html: SPLASH_READ_SCRIPT }} />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@fixed/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
