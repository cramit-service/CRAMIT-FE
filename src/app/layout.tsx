// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/shared/lib/QueryProvider';

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
    // LandingSplash의 인라인 스크립트가 하이드레이션 전에 data-splash를 찍는다.
    // 서버 HTML에는 없는 속성이라 경고가 나므로 html 요소에만 예외를 둔다(다크모드 스크립트와 같은 방식).
    <html lang="ko" suppressHydrationWarning>
      <head>
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
