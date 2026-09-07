'use client';
// src/mocks/materialStore.ts
// 백엔드가 파일을 보관하기 전까지 쓰는 임시 보관소.
// 올린 PDF를 브라우저(IndexedDB)에 넣어 두고 학습 뷰어가 그대로 그리게 한다.
// 메모리에만 들면 새로고침 한 번에 사라져 "올렸는데 안 보인다"가 된다.
//
// 백엔드가 pdfUrl을 내려주기 시작하면 이 파일과 호출하는 세 곳을 통째로 지운다.
const DB_NAME = 'cramit-mock';
const DB_VERSION = 1;
const STORE = 'materials';

// 같은 챕터를 다시 열 때마다 createObjectURL을 부르면 URL이 계속 쌓인다
const urlCache = new Map<string, string>();

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    // 사생활 보호 모드처럼 저장소가 막힌 환경에서는 그냥 포기한다(샘플로 떨어진다)
    request.onerror = () => resolve(null);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) return resolve(null);
        const request = run(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      }),
  );
}

export async function saveMaterialFile(chapterId: string, file: File | null) {
  if (!file) return;
  const cached = urlCache.get(chapterId);
  if (cached) {
    URL.revokeObjectURL(cached);
    urlCache.delete(chapterId);
  }
  await tx('readwrite', (store) => store.put(file, chapterId));
}

export async function getMaterialFileUrl(chapterId: string) {
  const cached = urlCache.get(chapterId);
  if (cached) return cached;

  const blob = await tx<Blob>('readonly', (store) => store.get(chapterId));
  if (!blob) return null;

  const url = URL.createObjectURL(blob);
  urlCache.set(chapterId, url);
  return url;
}
