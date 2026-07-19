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
    <html lang="ko">
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
