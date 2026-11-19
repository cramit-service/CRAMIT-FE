// scripts/test-alias.mjs
// node --test는 tsconfig의 paths를 모른다. `@/x`를 `src/x.ts`로 풀어 준다.
import { statSync } from 'node:fs';
import * as nodeModule from 'node:module';

// 없는 이름을 import하면 원인 모를 SyntaxError가 나서 직접 확인한다.
if (typeof nodeModule.registerHooks !== 'function') {
  throw new Error(
    `npm test는 Node 22.15 이상이 필요해요 (지금 ${process.version}).`,
  );
}

const SRC = new URL('../src/', import.meta.url);
// 확장자까지 쓴 import(@/x.ts)도 있어 원래 경로를 먼저 본다.
const SUFFIXES = ['', '.ts', '.tsx', '/index.ts'];
const isFile = (url) =>
  statSync(url, { throwIfNoEntry: false })?.isFile() ?? false;

nodeModule.registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const base = new URL(specifier.slice(2), SRC).href;
      const found = SUFFIXES.map((s) => new URL(base + s)).find(isFile);
      if (found) return nextResolve(found.href, context);
    }
    return nextResolve(specifier, context);
  },
});
