// src/features/study/lib/remarkLearningPoints.ts
// <lp>…</lp> 사이를 <mark>로 감싸는 remark 플러그인.
// react-markdown은 원문 HTML을 그리지 않고 버린다. 그래서 태그 두 개를 직접 찾아 그 사이를
// 하나의 노드로 묶는다. 두 태그가 같은 부모 안에 없으면(서식을 걸쳐 깨진 경우) 묶지 않는다.
import type { Parent, Root, RootContent } from 'mdast';
import { LP_CLOSE, LP_OPEN } from '@/features/study/lib/learningPoints';

const isTag = (node: RootContent, tag: string) =>
  node.type === 'html' && node.value === tag;

function wrap(parent: Parent) {
  const kids = parent.children as RootContent[];
  for (let i = 0; i < kids.length; i += 1) {
    const node = kids[i];
    if (isTag(node, LP_OPEN)) {
      const close = kids.findIndex((n, k) => k > i && isTag(n, LP_CLOSE));
      if (close !== -1) {
        const offset = node.position?.start.offset ?? -1;
        const mark = {
          type: 'learningPoint',
          children: kids.slice(i + 1, close),
          // remark-rehype는 모르는 노드라도 hName이 있으면 그 이름의 요소로 바꾼다
          data: {
            hName: 'mark',
            hProperties: { id: `lp-${offset}`, dataLp: offset },
          },
        } as unknown as RootContent;
        kids.splice(i, close - i + 1, mark);
      }
    }
    const current = kids[i];
    if ('children' in current) wrap(current as Parent);
  }
}

export function remarkLearningPoints() {
  return (tree: Root) => wrap(tree);
}
