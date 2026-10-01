// src/mocks/auth.ts — 인증(로그인/유저) mock
import type {
  LoginResponse,
  MyProfile,
  NotificationSettings,
  User,
} from '@/shared/types/api';

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

// 프로필 화면(대시보드-프로필) mock. 계정 정보 위에 요금제와 알림 설정이 얹힌다.
// 토글 두 개는 시안처럼 하나는 꺼짐, 하나는 켜짐으로 두어 양쪽 모양을 한 번에 볼 수 있게 한다.
export const mockMyProfile: MyProfile = {
  ...mockUser,
  plan: 'FREE',
  notifications: {
    aiAnalysisDone: false,
    todoDueDate: true,
  },
};

// mock 전용 쓰기 헬퍼. 새로고침하면 사라진다(모듈 메모리라 세션 단위).
// 조회는 복사본을 주므로(getMyProfile) 여기서 원본을 고쳐도 캐시 참조가 그대로 남지 않는다.

export function updateMockNickname(nickname: string): void {
  mockMyProfile.nickname = nickname;
}

export function updateMockNotifications(
  notifications: NotificationSettings,
): void {
  mockMyProfile.notifications = { ...notifications };
}
