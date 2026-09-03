// src/shared/lib/apiClient.ts
import type { ApiError } from '@/shared/types/api';

// 백엔드 base URL. 환경변수로 관리하고, 없으면 로컬 기본값 사용
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// 요청 옵션 (fetch 옵션 그대로). 우리 옵션을 더할 땐 교차 타입으로 확장한다.
// (빈 interface extends는 supertype과 같아 lint에 걸린다)
type RequestOptions = RequestInit;

// 토큰을 가져오는 함수 (지금은 localStorage 기준, 나중에 교체 가능)
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null; // 서버에서는 없음
  return localStorage.getItem('accessToken');
}

// 핵심 요청 함수
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const token = getAccessToken();

  // 파일 업로드는 FormData로 보낸다. 이때 Content-Type을 우리가 지정하면
  // multipart 경계(boundary)가 빠져 서버가 본문을 파싱하지 못한다.
  // 브라우저가 직접 붙이도록 헤더를 비우고, 본문도 직렬화하지 않는다.
  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  // options를 먼저 펼치고 method·headers·body를 뒤에 둔다.
  // 반대로 두면 호출처가 options.headers를 넘겼을 때 위에서 합쳐둔 헤더
  // (Authorization·Content-Type)가 통째로 교체된다. signal 같은 나머지 옵션은 그대로 살아난다.
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });

  return parseBody<T>(res.ok, res.status, await res.text());
}

// 응답 본문 파싱 + 에러 판정 (204 No Content 등 빈 응답 대비).
// 업로드처럼 큰 본문은 프록시·게이트웨이가 413·502·504를 HTML로 돌려주기도 한다.
// 그대로 JSON.parse하면 SyntaxError가 그대로 화면까지 올라가므로("Unexpected token '<'")
// 파싱 실패는 삼키고 상태 코드 분기가 판단하게 둔다.
// fetch 경로와 아래 XHR 업로드 경로가 같은 규칙을 쓰도록 한 곳에 둔다.
function parseBody<T>(ok: boolean, status: number, text: string): T {
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // 성공 응답인데 JSON이 아니면 호출처가 기대한 타입이 아니다. 여기서 끊는다.
      if (ok) {
        throw new ApiRequestError(
          'INVALID_RESPONSE',
          '서버 응답을 해석할 수 없습니다.',
          status,
        );
      }
    }
  }

  // 에러 응답 처리 (기획서 10.1 포맷)
  if (!ok) {
    const errorData = data as ApiError;
    throw new ApiRequestError(
      errorData?.error?.code ?? 'UNKNOWN',
      errorData?.error?.message ?? '요청 처리 중 오류가 발생했습니다.',
      status,
    );
  }

  return data as T;
}

// 커스텀 에러 클래스 (에러 코드·메시지·상태를 담아 던짐)
export class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// 업로드를 사용자가 직접 멈춘 경우. 호출처가 "실패"와 "취소"를 다르게 다뤄야 해서
// (취소는 에러 문구를 띄우지 않는다) 코드로 구분한다.
export const UPLOAD_ABORTED = 'UPLOAD_ABORTED';

export interface UploadOptions {
  /** 전송 진행률 0~1. 서버로 보낼 총 바이트를 모르면 호출되지 않는다. */
  onProgress?: (ratio: number) => void;
  /** 업로드 취소용. abort되면 UPLOAD_ABORTED 코드로 reject된다. */
  signal?: AbortSignal;
}

// 파일이 실려 가는 요청 전용 경로.
// fetch를 쓰지 않는 이유: fetch는 "응답을 받는" 진행률만 관측할 수 있고 "보내는" 진행률을
// 알려주지 않는다. 200MB짜리 녹음을 올리는 동안 화면에 아무것도 못 그리게 되므로
// 이 경로만 XMLHttpRequest를 쓴다(upload.onprogress). 나머지 요청은 그대로 fetch를 탄다.
function uploadRequest<T>(
  method: string,
  path: string,
  form: FormData,
  { onProgress, signal }: UploadOptions = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const aborted = () =>
      new ApiRequestError(UPLOAD_ABORTED, '업로드를 취소했어요.', 0);

    // 보내기도 전에 이미 취소된 경우 (취소 직후 재시도 등)
    if (signal?.aborted) {
      reject(aborted());
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open(method, `${BASE_URL}${path}`);

    // FormData의 multipart 경계(boundary)는 브라우저가 붙인다 — Content-Type을 직접 넣으면
    // 경계가 빠져 서버가 본문을 파싱하지 못한다 (fetch 경로와 같은 이유).
    const token = getAccessToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    // 총 바이트를 모르면(스트리밍 인코딩 등) 비율을 만들 수 없다. 그때는 알리지 않아
    // 호출처가 마지막으로 받은 값을 그대로 두게 한다 — 0으로 되돌리면 막대가 뒤로 간다.
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) onProgress?.(e.loaded / e.total);
    };

    // signal은 요청이 끝나면 더 들을 이유가 없다. 남겨두면 취소 한 번에
    // 이미 끝난 요청의 xhr까지 abort를 부른다.
    const onAbort = () => xhr.abort();
    signal?.addEventListener('abort', onAbort);
    const settle = (run: () => void) => {
      signal?.removeEventListener('abort', onAbort);
      run();
    };

    xhr.onload = () =>
      settle(() => {
        const ok = xhr.status >= 200 && xhr.status < 300;
        try {
          resolve(parseBody<T>(ok, xhr.status, xhr.responseText));
        } catch (error) {
          reject(error);
        }
      });
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
    xhr.ontimeout = () =>
      settle(() =>
        reject(
          new ApiRequestError('TIMEOUT', '업로드가 시간을 초과했어요.', 0),
        ),
      );

    xhr.send(form);
  });
}

// 실제로 화면에서 쓸 메서드들
export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),

  // 파일 업로드 (진행률·취소 지원). 본문은 항상 FormData다.
  upload: <T>(path: string, form: FormData, options?: UploadOptions) =>
    uploadRequest<T>('POST', path, form, options),

  uploadPatch: <T>(path: string, form: FormData, options?: UploadOptions) =>
    uploadRequest<T>('PATCH', path, form, options),
};
