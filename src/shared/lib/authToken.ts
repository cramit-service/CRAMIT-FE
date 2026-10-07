// src/shared/lib/authToken.ts
// accessToken 보관. refreshToken은 백엔드가 HttpOnly 쿠키로 심어 프론트는 만지지 않는다.
const ACCESS_TOKEN_KEY = 'accessToken';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null; // 서버에서는 없음
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
