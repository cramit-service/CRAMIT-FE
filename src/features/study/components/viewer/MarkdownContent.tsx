// src/features/study/components/viewer/MarkdownContent.tsx
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Markdown 원문을 요약 패널(surface) 안에 렌더한다.
// 제목은 20(body-md) → 18(body) → 16(body-sm)으로 내려간다. 20은 §3이 "카드 제목"에
// 준 칸이고, 이 h1도 판 안에서 읽는 글의 머리라 화면 제목(32)·모달 제목(24)보다 아래다.
// h1이 22(body-lg)였는데 그 칸은 §3이 쓰임을 못 정한 자리라 사다리 밖에 혼자 서 있었다.
// Tailwind Typography(prose)는 자체 색 팔레트를 끌고 들어와 @theme 토큰과 어긋나므로,
// 태그별 클래스를 직접 지정해 디자인 토큰만 쓰도록 한다.
const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-body-md mt-10 mb-4 font-semibold text-gray-800 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-body mt-9 mb-3 font-semibold text-gray-800 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-body-sm mt-7 mb-2 font-semibold text-gray-800 first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-body-sm my-3 text-gray-800">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-body-sm my-3 list-disc space-y-1 pl-5 text-gray-800">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-body-sm my-3 list-decimal space-y-1 pl-5 text-gray-800">
      {children}
    </ol>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-800">{children}</strong>
  ),
  em: ({ children }) => <em className="text-gray-700 italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      // §2에 링크 잉크가 없다. 하늘은 제품이 알려주는 것이고 연두는 L*가 95라
      // 글자로는 안 보인다 — 색을 새로 빌리지 않고 밑줄만으로 링크를 말한다.
      className="text-gray-800 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  // 왼쪽 선만으로 인용을 말한다. border-primary-400은 토큰에 없어 선이 아예 안 나왔고,
  // 짝이던 bg-gray-200 채움은 §2가 비활성에 준 자리라 인용이 꺼진 것처럼 보였다.
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-gray-300 py-2 pl-4 text-gray-700">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-gray-300" />,
  // 표는 좁은 화면에서 넘칠 수 있어 가로 스크롤 컨테이너로 감싼다
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="text-label w-full border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 bg-gray-200 px-3 py-2 text-left font-medium text-gray-800">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-3 py-2 text-gray-800">
      {children}
    </td>
  ),
  // react-markdown v10: 코드 블록은 pre > code로 오고, 인라인 코드는 pre 없이 온다.
  // code에서 둘을 구분하려 하면 부모를 알 수 없어, pre에 블록 스타일을 준다.
  pre: ({ children }) => (
    <pre className="text-label bg-well my-4 overflow-x-auto rounded-md p-4 text-gray-700">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code
      // 블록 안(pre 자식)에서는 배경을 지워 pre 배경만 보이게 한다
      className="text-label rounded-md bg-gray-200 px-1 py-0.5 font-mono text-gray-800 [pre_&]:bg-transparent [pre_&]:p-0"
    >
      {children}
    </code>
  ),
};

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {markdown}
    </ReactMarkdown>
  );
}
