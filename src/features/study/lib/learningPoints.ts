// src/features/study/lib/learningPoints.ts
// 학습포인트는 요약 markdown 안의 <lp>…</lp> 태그로만 존재한다. 저장은 요약 수정과 같은 길로 간다.
//
// 주석(<!--lp-->)이 아니라 태그인 이유: CommonMark는 줄 머리의 `<!--`를 HTML 블록의 시작으로 읽어서,
// 목록 항목을 통째로 고르면 그 줄 전체가 HTML로 빠지고 글이 화면에서 사라진다.
// 이름만 있는 인라인 태그(<lp>)는 줄 머리에 와도 뒤에 글이 이어지면 블록이 되지 않는다.

export const LP_OPEN = '<lp>';
export const LP_CLOSE = '</lp>';

// 화면에 고른 글과 원문은 모양이 다르다(`**병합** 정렬` → "병합 정렬").
// 서식 기호를 걷어낸 "보이는 글"을 만들고, 그 글자마다 원문 위치를 기억해 둔다.
const MARKUP = new Set(['*', '`', '~', '[', ']']);

interface Visible {
  text: string;
  // text[i]가 원문의 어느 인덱스에서 왔는지
  at: number[];
}

function toVisible(source: string): Visible {
  let text = '';
  const at: number[] = [];
  let i = 0;
  while (i < source.length) {
    if (source.startsWith(LP_OPEN, i)) {
      i += LP_OPEN.length;
      continue;
    }
    if (source.startsWith(LP_CLOSE, i)) {
      i += LP_CLOSE.length;
      continue;
    }
    const ch = source[i];
    // 링크 주소 `](url)`는 화면에 안 나온다
    if (ch === ']' && source[i + 1] === '(') {
      const end = source.indexOf(')', i + 2);
      if (end !== -1) {
        i = end + 1;
        continue;
      }
    }
    if (ch === '\\' && i + 1 < source.length) {
      text += source[i + 1];
      at.push(i + 1);
      i += 2;
      continue;
    }
    if (MARKUP.has(ch)) {
      i += 1;
      continue;
    }
    // 줄바꿈·연속 공백은 화면에서 한 칸이다
    if (/\s/.test(ch)) {
      if (!text.endsWith(' ')) {
        text += ' ';
        at.push(i);
      }
      i += 1;
      continue;
    }
    text += ch;
    at.push(i);
    i += 1;
  }
  return { text, at };
}

export function normalizeSelection(selected: string): string {
  return selected.replace(/\s+/g, ' ').trim();
}

// 고른 범위 안에서 서식이 열리고 닫혀야 태그 한 쌍이 같은 부모 안에 들어간다.
// 개수만 세면 `병합** 정렬`처럼 닫는 쪽만 둘인 범위도 짝수라 통과해 버린다. 순서대로 짝을 맞춘다.
function balanced(slice: string) {
  const stack: string[] = [];
  let i = 0;
  while (i < slice.length) {
    const ch = slice[i];
    if (ch === '[') {
      stack.push('[');
      i += 1;
    } else if (ch === ']') {
      if (stack.pop() !== '[') return false;
      i += 1;
    } else if (ch === '*' || ch === '`' || ch === '~') {
      let run = ch;
      while (slice[i + run.length] === ch) run += ch;
      if (stack[stack.length - 1] === run) stack.pop();
      else stack.push(run);
      i += run.length;
    } else {
      i += 1;
    }
  }
  return stack.length === 0;
}

export type AddResult =
  | { ok: true; markdown: string }
  | { ok: false; reason: 'not-found' | 'overlap' | 'markup' };

/**
 * 고른 글을 <lp> 태그로 감싼다. 같은 글이 여러 번 나오면 occurrence번째(0부터)를 쓴다.
 * 서식 경계를 반쯤 걸치면 바깥 기호까지 넓혀 보고, 그래도 안 맞으면 거절한다.
 */
export function addLearningPoint(
  markdown: string,
  selected: string,
  occurrence = 0,
): AddResult {
  const needle = normalizeSelection(selected);
  if (!needle) return { ok: false, reason: 'not-found' };

  const { text, at } = toVisible(markdown);
  let found = -1;
  for (let i = 0, from = 0; i <= occurrence; i += 1) {
    found = text.indexOf(needle, from);
    if (found === -1) break;
    from = found + 1;
  }
  // 몇 번째인지가 어긋나면(화면과 원문의 차이) 첫 번째라도 쓴다
  if (found === -1) found = text.indexOf(needle);
  if (found === -1) return { ok: false, reason: 'not-found' };

  let start = at[found];
  let end = at[found + needle.length - 1] + 1;

  const inside = markdown.slice(start, end);
  if (inside.includes(LP_OPEN) || inside.includes(LP_CLOSE)) {
    return { ok: false, reason: 'overlap' };
  }
  // 이미 학습포인트 안에 있는 글인지: 앞쪽에 닫히지 않은 <lp>가 있으면 안이다
  const before = markdown.slice(0, start);
  if (before.lastIndexOf(LP_OPEN) > before.lastIndexOf(LP_CLOSE)) {
    return { ok: false, reason: 'overlap' };
  }

  // `**병합** 정렬`에서 "병합 정렬"을 고르면 시작이 ** 안쪽이다. 바로 앞뒤 기호를 하나씩 넓혀 본다.
  while (!balanced(markdown.slice(start, end))) {
    if (start > 0 && MARKUP.has(markdown[start - 1])) {
      start -= 1;
    } else if (end < markdown.length && MARKUP.has(markdown[end])) {
      end += 1;
    } else if (markdown[end] === '(' && markdown[end - 1] === ']') {
      const close = markdown.indexOf(')', end);
      if (close === -1) break;
      end = close + 1;
    } else {
      break;
    }
  }
  if (!balanced(markdown.slice(start, end))) {
    return { ok: false, reason: 'markup' };
  }

  return {
    ok: true,
    markdown:
      markdown.slice(0, start) +
      LP_OPEN +
      markdown.slice(start, end) +
      LP_CLOSE +
      markdown.slice(end),
  };
}

/** openOffset 자리의 <lp>와 그 짝 </lp>만 빼고 글은 남긴다. 자리가 어긋났으면 null. */
export function removeLearningPoint(
  markdown: string,
  openOffset: number,
): string | null {
  if (!markdown.startsWith(LP_OPEN, openOffset)) return null;
  const close = markdown.indexOf(LP_CLOSE, openOffset + LP_OPEN.length);
  if (close === -1) return null;
  return (
    markdown.slice(0, openOffset) +
    markdown.slice(openOffset + LP_OPEN.length, close) +
    markdown.slice(close + LP_CLOSE.length)
  );
}

/** 편집 모드 안내와 레일 자리를 띄울지 정할 때 쓴다. */
export function hasLearningPoints(markdown: string) {
  return markdown.includes(LP_OPEN);
}

/** 화면 글에서 range 앞쪽에 needle이 몇 번 나왔는지. 같은 글이 여러 번 있을 때 원문의 몇 번째인지 맞춘다. */
export function occurrenceBefore(textBefore: string, selected: string) {
  const needle = normalizeSelection(selected);
  const hay = normalizeSelection(textBefore);
  if (!needle) return 0;
  let count = 0;
  for (let i = hay.indexOf(needle); i !== -1; i = hay.indexOf(needle, i + 1)) {
    count += 1;
  }
  return count;
}

export interface LearningPointItem {
  // 원문에서 <lp>가 시작하는 자리. 하이라이트의 id(lp-<offset>)와 같다.
  offset: number;
  text: string;
}

/** 원문 순서대로 학습포인트 목록. 사이드 레일이 쓴다. */
export function listLearningPoints(markdown: string): LearningPointItem[] {
  const items: LearningPointItem[] = [];
  const pattern = /<lp>([\s\S]*?)<\/lp>/g;
  for (const match of markdown.matchAll(pattern)) {
    items.push({
      offset: match.index,
      text: toVisible(match[1]).text.trim(),
    });
  }
  return items;
}
