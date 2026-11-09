// src/shared/lib/apiClient.test.ts — npm test
// mock은 apiClient를 거치지 않아 화면으로는 검증할 수 없다. fetch를 바꿔 끼워 응답 규칙만 잰다.
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiRequestError, apiClient, refreshAccessToken } from './apiClient.ts';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
  Reflect.deleteProperty(globalThis, 'window');
  Reflect.deleteProperty(globalThis, 'localStorage');
});

// 재발급 실패 규칙은 토큰 저장소와 페이지 이동까지 봐야 해서 브라우저 전역을 바꿔 끼운다.
function stubBrowser(token: string) {
  const store = new Map([['accessToken', token]]);
  const redirects: string[] = [];
  const define = (name: string, value: unknown) =>
    Object.defineProperty(globalThis, name, { value, configurable: true });

  define('window', {
    location: { replace: (url: string) => redirects.push(url) },
  });
  define('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  });
  return { store, redirects };
}

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

test('timeoutMs를 주면 그 시간으로, 안 주면 기본 15초로 끊는다', async (t) => {
  const asked: number[] = [];
  t.mock.method(AbortSignal, 'timeout', (ms: number) => {
    asked.push(ms);
    return new AbortController().signal;
  });
  const inits: RequestInit[] = [];
  globalThis.fetch = (async (_: string, init: RequestInit) => {
    inits.push(init);
    return new Response(JSON.stringify({ data: [] }), { status: 200 });
  }) as typeof fetch;
  await apiClient.post(
    '/chat-bot-sessions/1/messages',
    {},
    { timeoutMs: 70_000 },
  );
  await apiClient.get('/todos');
  assert.deepEqual(asked, [70_000, 15_000]);
  // 우리 옵션이 fetch로 새지 않는다
  assert.ok(inits.every((init) => !('timeoutMs' in init)));
});

test('AbortSignal.any가 없는 브라우저에서도 호출처 signal과 타임아웃을 함께 건다', async (t) => {
  const timeout = new AbortController();
  t.mock.method(AbortSignal, 'timeout', () => timeout.signal);
  const realAny = AbortSignal.any;
  // @ts-expect-error Safari 17.3 이하를 흉내 낸다
  delete AbortSignal.any;
  t.after(() => {
    AbortSignal.any = realAny;
  });
  globalThis.fetch = ((_: string, init?: RequestInit) =>
    new Promise((_, reject) =>
      init?.signal?.addEventListener('abort', () =>
        reject(init.signal?.reason),
      ),
    )) as typeof fetch;
  const caller = new AbortController();
  const pending = apiClient.get('/todos', { signal: caller.signal });
  timeout.abort(new DOMException('timeout', 'TimeoutError'));
  await assert.rejects(pending, { code: 'TIMEOUT' });
});

test('호출처 취소와 타임아웃이 겹치면 취소로 본다', async (t) => {
  const timeout = new AbortController();
  t.mock.method(AbortSignal, 'timeout', () => timeout.signal);
  globalThis.fetch = ((_: string, init?: RequestInit) =>
    new Promise((_, reject) =>
      init?.signal?.addEventListener('abort', () =>
        reject(init.signal?.reason),
      ),
    )) as typeof fetch;
  const caller = new AbortController();
  const pending = apiClient.get('/todos', { signal: caller.signal });
  // catch가 돌기 전에 둘 다 끊긴다.
  caller.abort();
  timeout.abort(new DOMException('timeout', 'TimeoutError'));
  await assert.rejects(pending, (error) => !(error instanceof ApiRequestError));
});

const SESSION_REJECTED =
  '{"error":{"code":"AUTH_INVALID_TOKEN","message":"만료","status":401}}';

test('재발급이 401이면 토큰을 지우고 /login으로 보낸다', async () => {
  const { store, redirects } = stubBrowser('old');
  respond(SESSION_REJECTED, 401);

  assert.equal(await refreshAccessToken(), null);
  assert.equal(store.has('accessToken'), false);
  assert.deepEqual(redirects, ['/login']);
});

test('재발급이 5xx면 토큰을 두고 이동하지 않는다', async () => {
  const { store, redirects } = stubBrowser('old');
  respond('', 500);

  assert.equal(await refreshAccessToken(), null);
  assert.equal(store.get('accessToken'), 'old');
  assert.deepEqual(redirects, []);
});

test('재발급이 네트워크로 실패하면 토큰을 두고 이동하지 않는다', async () => {
  const { store, redirects } = stubBrowser('old');
  globalThis.fetch = (() =>
    Promise.reject(new TypeError('Failed to fetch'))) as typeof fetch;

  assert.equal(await refreshAccessToken(), null);
  assert.equal(store.get('accessToken'), 'old');
  assert.deepEqual(redirects, []);
});

test('다른 탭이 먼저 재발급했으면 401이어도 그 토큰을 쓴다', async () => {
  const { store, redirects } = stubBrowser('old');
  globalThis.fetch = (async () => {
    store.set('accessToken', 'from-other-tab');
    return new Response(SESSION_REJECTED, { status: 401 });
  }) as typeof fetch;

  assert.equal(await refreshAccessToken(), 'from-other-tab');
  assert.equal(store.get('accessToken'), 'from-other-tab');
  assert.deepEqual(redirects, []);
});
