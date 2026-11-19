// src/features/project/lib/upload.ts
// 새 주차 업로드에서 받는 파일 2종의 제약과 검사. 시안 안내 문구와 값이 같아야 한다.

import {
  ApiRequestError,
  UPLOAD_ABORTED,
  type UploadOptions,
} from '@/shared/lib/apiClient';

export type UploadKind = 'material' | 'audio';

interface UploadSpec {
  label: string; // 에러 문구에 쓰는 이름
  extensions: string[]; // 허용 확장자 (소문자, 점 포함)
  accept: string; // <input accept="...">
  maxBytes: number;
  hint: string; // 드롭존 안내 첫 줄
  formatHint: string; // 드롭존 안내 둘째 줄 (시안 문구 그대로)
}

const MB = 1024 * 1024;

// MIME 타입은 브라우저·OS마다 제각각이라(m4a가 audio/x-m4a·audio/mp4·빈 문자열로 온다)
// 검사는 확장자로 하고, accept에는 편의를 위해 MIME도 함께 적는다.
export const UPLOAD_SPEC: Record<UploadKind, UploadSpec> = {
  material: {
    label: '강의 자료',
    extensions: ['.pdf'],
    accept: '.pdf,application/pdf',
    maxBytes: 50 * MB,
    hint: '강의 슬라이드/자료를 끌어다 놓거나 클릭',
    formatHint: 'pdf · 최대 50MB',
  },
  audio: {
    label: '음성 파일',
    extensions: ['.mp3', '.wav', '.m4a', '.mp4'],
    accept: '.mp3,.wav,.m4a,.mp4,audio/*,video/mp4',
    maxBytes: 200 * MB,
    hint: '강의 녹음 파일을 끌어다 놓거나 클릭',
    formatHint: 'mp3, wav, m4a, mp4 · 최대 200MB',
  },
};

// 파일 크기 표시: 1024 → "1.0KB", 52428800 → "50.0MB"
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / MB).toFixed(1)}MB`;
}

// 통과하면 null, 걸리면 사용자에게 보여줄 문구를 돌려준다.
export function validateUpload(file: File, kind: UploadKind): string | null {
  const spec = UPLOAD_SPEC[kind];

  const lower = file.name.toLowerCase();
  if (!spec.extensions.some((ext) => lower.endsWith(ext))) {
    return `${spec.label}는 ${spec.extensions.join(', ')} 파일만 올릴 수 있어요.`;
  }
  if (file.size > spec.maxBytes) {
    return `파일이 너무 커요. ${formatFileSize(spec.maxBytes)}까지 올릴 수 있어요. (현재 ${formatFileSize(file.size)})`;
  }
  // 빈 파일은 업로드해도 STT·요약이 만들어지지 않는다. 올리기 전에 막는다.
  if (file.size === 0) {
    return '빈 파일이에요. 내용이 있는 파일을 골라주세요.';
  }
  return null;
}

// presigned URL로 저장소(R2)에 직접 올린다. apiClient를 거치지 않는 이유는 우리 서버가 아니라서다 —
// 우리 토큰이 실려 가면 안 되고, 응답도 { data } 계약이 아니다.
// fetch가 아니라 XHR인 이유는 apiClient의 업로드 경로와 같다(보내는 진행률은 XHR만 준다).
export function putToStorage(
  url: string,
  file: File,
  { onProgress, signal }: UploadOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const aborted = () =>
      new ApiRequestError(UPLOAD_ABORTED, '업로드를 취소했어요.', 0);
    if (signal?.aborted) {
      reject(aborted());
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader(
      'Content-Type',
      file.type || 'application/octet-stream',
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) onProgress?.(e.loaded / e.total);
    };

    const onAbort = () => xhr.abort();
    signal?.addEventListener('abort', onAbort);
    const settle = (run: () => void) => {
      signal?.removeEventListener('abort', onAbort);
      run();
    };

    xhr.onload = () =>
      settle(() =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(
              new ApiRequestError(
                'UPLOAD_FAILED',
                '파일을 올리지 못했어요. 잠시 후 다시 시도해 주세요.',
                xhr.status,
              ),
            ),
      );
    xhr.onerror = () =>
      settle(() =>
        reject(
          new ApiRequestError(
            'NETWORK',
            '네트워크 문제로 업로드하지 못했어요.',
            0,
          ),
        ),
      );
    xhr.onabort = () => settle(() => reject(aborted()));
    xhr.send(file);
  });
}

const MEASURE_TIMEOUT_MS = 10_000;

// 녹음 길이(초). 서버가 STT 전에 길이를 알 방법이 없어 브라우저가 재서 보낸다.
// 못 재면 null — 서버도 비어 있는 값을 받는다. 브라우저가 메타데이터 이벤트를 끝내 안 주는
// 형식이 있어 시간 제한을 둔다. 없으면 업로드가 시작도 못 하고 멈춘다.
export function measureAudioDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const src = URL.createObjectURL(file);
    const audio = new Audio();
    const timer = setTimeout(() => done(null), MEASURE_TIMEOUT_MS);
    const done = (seconds: number | null) => {
      clearTimeout(timer);
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.removeAttribute('src');
      audio.load();
      URL.revokeObjectURL(src);
      resolve(seconds);
    };
    audio.preload = 'metadata';
    audio.onloadedmetadata = () =>
      done(Number.isFinite(audio.duration) ? Math.round(audio.duration) : null);
    audio.onerror = () => done(null);
    audio.src = src;
  });
}
