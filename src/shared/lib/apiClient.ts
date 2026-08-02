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

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...options,
  });

  // 응답 본문 파싱 (204 No Content 등 빈 응답 대비)
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  // 에러 응답 처리 (기획서 10.1 포맷)
  if (!res.ok) {
    const errorData = data as ApiError;
    throw new ApiRequestError(
      errorData?.error?.code ?? 'UNKNOWN',
      errorData?.error?.message ?? '요청 처리 중 오류가 발생했습니다.',
      res.status,
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
};
