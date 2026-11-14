// src/features/study/lib/learningPoints.test.ts — npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addLearningPoint,
  listLearningPoints,
  occurrenceBefore,
  removeLearningPoint,
} from './learningPoints.ts';

test('고른 글을 원문에서 찾아 태그로 감싼다', () => {
  const md = '## 정렬\n- 병합 정렬은 반으로 나눈다.';
  assert.deepEqual(addLearningPoint(md, '병합 정렬'), {
    ok: true,
    markdown: '## 정렬\n- <lp>병합 정렬</lp>은 반으로 나눈다.',
  });
});

test('서식 기호를 반쯤 걸치면 바깥 기호까지 넓혀 감싼다', () => {
  const md = '**병합** 정렬은 빠르다.';
  assert.deepEqual(addLearningPoint(md, '병합 정렬'), {
    ok: true,
    markdown: '<lp>**병합** 정렬</lp>은 빠르다.',
  });
});

test('링크 글을 걸치면 링크 전체를 감싼다', () => {
  const md = '[위키](https://a.b/c) 문서를 본다.';
  assert.deepEqual(addLearningPoint(md, '위키 문서'), {
    ok: true,
    markdown: '<lp>[위키](https://a.b/c) 문서</lp>를 본다.',
  });
});

test('같은 글이 여러 번 나오면 몇 번째인지 따른다', () => {
  const md = '정렬. 정렬. 정렬.';
  assert.deepEqual(addLearningPoint(md, '정렬', 1), {
    ok: true,
    markdown: '정렬. <lp>정렬</lp>. 정렬.',
  });
  assert.equal(occurrenceBefore('정렬. 정렬. ', '정렬'), 2);
});

test('이미 학습포인트인 글과 겹치면 거절한다', () => {
  const md = '<lp>병합 정렬</lp>은 빠르다.';
  assert.deepEqual(addLearningPoint(md, '정렬은'), {
    ok: false,
    reason: 'overlap',
  });
  assert.deepEqual(addLearningPoint(md, '병합'), {
    ok: false,
    reason: 'overlap',
  });
});

test('원문에 없는 글은 거절한다', () => {
  assert.deepEqual(addLearningPoint('정렬', '탐색'), {
    ok: false,
    reason: 'not-found',
  });
});

test('해제하면 태그만 빠지고 글은 남는다', () => {
  const md = 'a <lp>b</lp> c <lp>d</lp>';
  assert.equal(
    removeLearningPoint(md, md.lastIndexOf('<lp>')),
    'a <lp>b</lp> c d',
  );
  assert.equal(removeLearningPoint(md, 1), null);
});

test('목록은 원문 순서와 보이는 글로 만든다', () => {
  const md = '<lp>**병합** 정렬</lp> 그리고 <lp>`퀵` 정렬</lp>';
  assert.deepEqual(listLearningPoints(md), [
    { offset: 0, text: '병합 정렬' },
    { offset: md.lastIndexOf('<lp>'), text: '퀵 정렬' },
  ]);
});
