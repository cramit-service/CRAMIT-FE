// scripts/copy-pdfjs-assets.mjs
// pdf.js가 런타임에 fetch로 가져가는 데이터를 public/으로 옮긴다.
// - cmaps: 한글 강의자료가 흔히 쓰는 CID 폰트를 그리려면 필요하다. 없으면 글자가 빈다.
// - standard_fonts: 폰트를 임베드하지 않은 PDF(Helvetica 등 base14)를 그릴 때 쓴다.
// node_modules에서 복사하므로 pdfjs-dist 버전과 늘 같이 움직인다(레포에 커밋하지 않는다).
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'pdfjs-dist');
const dest = join(root, 'public', 'pdfjs');
const stamp = join(dest, '.version');

const { version } = JSON.parse(
  await readFile(join(src, 'package.json'), 'utf8'),
);

// 같은 버전이 이미 복사돼 있으면 건너뛴다 (predev/prebuild에서 매번 도는 걸 막는다)
if (existsSync(stamp) && (await readFile(stamp, 'utf8')) === version) {
  process.exit(0);
}

await mkdir(dest, { recursive: true });
for (const dir of ['cmaps', 'standard_fonts']) {
  await cp(join(src, dir), join(dest, dir), { recursive: true });
}
await writeFile(stamp, version);
console.log(`pdfjs assets copied (v${version})`);
