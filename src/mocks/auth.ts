// src/mocks/auth.ts — 인증(로그인/유저) mock
import type { LoginResponse, User } from '@/shared/types/api';

// 소셜 로그인 mock 응답 (백엔드 연동 전까지 사용)
export const mockLoginResponse: LoginResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

export const mockUser: User = {
  userId: '1',
  email: 'test@cramit.com',
  nickname: '김진우',
  provider: 'EMAIL',
  profileImage: null,
};
