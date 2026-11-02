// scripts/test-alias.mjs
// node --test는 tsconfig의 paths를 모른다. `@/x`를 `src/x.ts`로 풀어 준다.
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';

const SRC = new URL('../src/', import.meta.url);
const EXTENSIONS = ['.ts', '.tsx', '/index.ts'];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const base = new URL(specifier.slice(2), SRC).href;
      const found = EXTENSIONS.map((ext) => new URL(base + ext)).find(
        existsSync,
      );
      if (found) return nextResolve(found.href, context);
    }
    return nextResolve(specifier, context);
  },
});
