// src/features/study/components/viewer/MarkdownContent.tsx
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Markdown 원문을 흰 영역에 렌더한다.
// Tailwind Typography(prose)는 자체 색 팔레트를 끌고 들어와 @theme 토큰과 어긋나므로,
// 태그별 클래스를 직접 지정해 디자인 토큰만 쓰도록 한다.
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-4 text-[22px] leading-[32px] font-semibold tracking-[-0.44px] text-gray-950 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-9 mb-3 text-[18px] leading-[28px] font-semibold tracking-[-0.36px] text-gray-950 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-7 mb-2 text-[16px] leading-[26px] font-semibold tracking-[-0.32px] text-gray-900 first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-3 text-[14px] leading-[24px] tracking-[-0.28px] text-gray-800">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 list-disc space-y-1 pl-5 text-[14px] leading-[24px] tracking-[-0.28px] text-gray-800">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1 pl-5 text-[14px] leading-[24px] tracking-[-0.28px] text-gray-800">
      {children}
    </ol>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-950">{children}</strong>
  ),
  em: ({ children }) => <em className="text-gray-700 italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-secondary-600 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  // 인용은 시그니처 색(연두)으로 왼쪽 선을 준다
  blockquote: ({ children }) => (
    <blockquote className="border-primary-400 my-4 border-l-4 bg-gray-200 py-2 pl-4 text-gray-700">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-gray-300" />,
  // 표는 좁은 화면에서 넘칠 수 있어 가로 스크롤 컨테이너로 감싼다
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-[14px] leading-[22px] tracking-[-0.28px]">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 bg-gray-200 px-3 py-2 text-left font-medium text-gray-900">
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
    <pre className="my-4 overflow-x-auto rounded-md bg-gray-900 p-4 text-[13px] leading-[20px] text-gray-200">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code
      // 블록 안(pre 자식)에서는 배경을 지워 pre 배경만 보이게 한다
      className="rounded-sm bg-gray-200 px-1 py-0.5 font-mono text-[13px] text-gray-900 [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-gray-200"
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
