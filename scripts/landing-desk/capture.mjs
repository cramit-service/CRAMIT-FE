// scripts/landing-desk/capture.mjs
// desk.html을 헤드리스 Chrome으로 열어 바탕화면 1장과 창 7장을 public/landing/desk/*.webp로 뽑는다.
// 실행: node scripts/landing-desk/capture.mjs  (Chrome 경로가 다르면 CHROME_PATH로 준다)
// 창 위치나 크기를 바꾸면 끝에 찍히는 좌표로 Desk.tsx의 WINDOWS도 같이 고친다.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../../public/landing/desk');
const CHROME =
  process.env.CHROME_PATH ??
  {
    win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  }[process.platform] ??
  'google-chrome';
const PORT = 9350;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'landing-desk-'))}`,
    '--no-first-run',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let targets = [];
for (let i = 0; i < 40 && !targets.some((t) => t.type === 'page'); i++) {
  await sleep(500);
  try {
    targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  } catch {
    // Chrome이 아직 뜨는 중
  }
}
const ws = new WebSocket(
  targets.find((t) => t.type === 'page').webSocketDebuggerUrl,
);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const evaluate = async (expression) =>
  (
    await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
  ).result?.result?.value;

// 2배 해상도, 투명 바탕. webp는 알파를 그대로 담는다
async function shot(name, clip) {
  const r = await send('Page.captureScreenshot', {
    format: 'webp',
    quality: 84,
    clip: { ...clip, scale: 1 },
  });
  writeFileSync(
    join(out, `${name}.webp`),
    Buffer.from(r.result.data, 'base64'),
  );
  console.log(name);
}

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1200,
  height: 720,
  deviceScaleFactor: 2,
  mobile: false,
});
await send('Emulation.setDefaultBackgroundColorOverride', {
  color: { r: 0, g: 0, b: 0, a: 0 },
});
await send('Page.navigate', {
  url: pathToFileURL(join(here, 'desk.html')).href,
});
await sleep(4000);
await evaluate('document.fonts.ready.then(() => true)');

const windows = await evaluate(
  "[...document.querySelectorAll('.win')].map((w) => ({ id: w.dataset.w, x: w.offsetLeft, y: w.offsetTop, w: w.offsetWidth, h: w.offsetHeight }))",
);

await evaluate("document.body.className = 'wall-mode'; true");
await sleep(300);
await shot('wallpaper', { x: 0, y: 0, width: 1120, height: 660 });

await evaluate("document.body.className = 'win-mode'; true");
for (const w of windows) {
  await evaluate(
    `document.querySelectorAll('.win').forEach((n) => { n.classList.toggle('only', n.dataset.w === '${w.id}'); n.classList.toggle('front', n.dataset.w === '${w.id}'); }); true`,
  );
  await sleep(250);
  await shot(w.id, { x: w.x, y: w.y, width: w.w, height: w.h });
}

console.log(JSON.stringify(windows, null, 2));
ws.close();
chrome.kill();
process.exit(0);
