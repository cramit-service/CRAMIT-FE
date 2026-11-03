// src/shared/lib/quote.test.ts — npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitQuote, toQuote, withQuote } from './quote.ts';

test('고른 글은 한 줄로 펴고 500자에서 자른다', () => {
  assert.equal(toQuote('  첫 줄\n\n둘째   줄 '), '첫 줄 둘째 줄');
  const long = toQuote('가'.repeat(600));
  assert.equal(long.length, 501);
  assert.ok(long.endsWith('…'));
  // 이모지가 경계에 걸려도 반쪽(외톨이 서로게이트)이 남지 않는다
  const emoji = toQuote(`${'가'.repeat(499)}😀😀`);
  assert.equal(Array.from(emoji).at(-2), '😀');
  assert.ok(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(emoji));
});

test('인용 붙은 질문은 다시 인용과 질문으로 나뉜다', () => {
  const sent = withQuote(
    '좋은 알고리즘의 조건',
    '이 부분 쉽게 설명해줘\n두 줄째',
  );
  assert.deepEqual(splitQuote(sent), {
    quote: '좋은 알고리즘의 조건',
    question: '이 부분 쉽게 설명해줘\n두 줄째',
  });
});

test('인용 없는 질문과 >로 시작하는 한 줄은 그대로 둔다', () => {
  assert.deepEqual(splitQuote('그냥 질문'), {
    quote: null,
    question: '그냥 질문',
  });
  assert.deepEqual(splitQuote('> 이건 인용 모양만'), {
    quote: null,
    question: '> 이건 인용 모양만',
  });
});
