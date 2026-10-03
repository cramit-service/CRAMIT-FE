// src/shared/lib/apiClient.test.ts — npm test
// mock은 apiClient를 거치지 않아 화면으로는 검증할 수 없다. fetch를 바꿔 끼워 응답 규칙만 잰다.
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiRequestError, apiClient } from './apiClient.ts';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

// 마지막으로 요청한 URL을 함께 돌려준다.
function respond(body: string, status: number) {
  const calls: string[] = [];
  globalThis.fetch = (async (url: string) => {
    calls.push(url);
    return new Response(body || null, { status });
  }) as typeof fetch;
  return calls;
}

test('성공 응답에서 data를 꺼내고 경로 앞에 /api를 붙인다', async () => {
  const calls = respond('{"data":[{"todoId":1}]}', 200);
  assert.deepEqual(await apiClient.get('/todos'), [{ todoId: 1 }]);
  assert.match(calls[0], /\/api\/todos$/);
});

test('204 빈 본문은 null', async () => {
  respond('', 204);
  assert.equal(await apiClient.delete('/todos/1'), null);
});

test('에러 응답은 error.code·message·상태를 담아 던진다', async () => {
  respond(
    '{"error":{"code":"TODO_NOT_FOUND","message":"없어요","status":404}}',
    404,
  );
  await assert.rejects(apiClient.get('/todos/1'), {
    code: 'TODO_NOT_FOUND',
    message: '없어요',
    status: 404,
  });
});

test('성공인데 JSON이 아니거나 data가 없으면 INVALID_RESPONSE', async () => {
  respond('<html>gateway</html>', 200);
  await assert.rejects(apiClient.get('/todos'), { code: 'INVALID_RESPONSE' });
  respond('{"todoId":1}', 200);
  await assert.rejects(apiClient.get('/todos'), { code: 'INVALID_RESPONSE' });
});

test('JSON이 아닌 에러 응답은 UNKNOWN', async () => {
  respond('<html>502</html>', 502);
  await assert.rejects(apiClient.get('/todos'), {
    code: 'UNKNOWN',
    status: 502,
  });
});

test('연결 실패는 NETWORK, 호출처 취소는 원래 에러 그대로', async () => {
  globalThis.fetch = (async (_: string, init?: RequestInit) => {
    init?.signal?.throwIfAborted();
    throw new TypeError('Failed to fetch');
  }) as typeof fetch;
  await assert.rejects(apiClient.get('/todos'), { code: 'NETWORK' });

  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    apiClient.get('/todos', { signal: controller.signal }),
    (error) => !(error instanceof ApiRequestError),
  );
});

test('응답이 오지 않으면 TIMEOUT', async (t) => {
  // AbortSignal.timeout은 setTimeout을 타지 않아 가짜 타이머로 당길 수 없다. 직접 끊는다.
  const timeout = new AbortController();
  t.mock.method(AbortSignal, 'timeout', () => timeout.signal);
  globalThis.fetch = ((_: string, init?: RequestInit) =>
    new Promise((_, reject) =>
      init?.signal?.addEventListener('abort', () =>
        reject(init.signal?.reason),
      ),
    )) as typeof fetch;
  const pending = apiClient.get('/todos');
  timeout.abort(new DOMException('timeout', 'TimeoutError'));
  await assert.rejects(pending, { code: 'TIMEOUT' });
});
