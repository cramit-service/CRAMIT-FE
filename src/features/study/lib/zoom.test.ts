// src/features/study/lib/zoom.test.ts — npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatZoom, stepZoom } from './zoom.ts';

test('한 단계씩 키우고 줄이며 양 끝에서는 멈춘다', () => {
  assert.equal(stepZoom(1, 1), 1.25);
  assert.equal(stepZoom(1.5, 1), 2);
  assert.equal(stepZoom(3, 1), 3);
  assert.equal(stepZoom(2, -1), 1.5);
  assert.equal(stepZoom(1, -1), 1);
});

test('배율은 정수 퍼센트로 보인다', () => {
  assert.equal(formatZoom(1), '100%');
  assert.equal(formatZoom(1.25), '125%');
});
