// src/features/settings/api.ts
import type {
  MyProfile,
  NotificationSettings,
  User,
  UserProfileResponse,
} from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import { mockMyProfile, updateMockNotifications } from '@/mocks/auth';

// 알림 설정만 목이다. 백엔드에 알림 설정 API가 없다.
const USE_MOCK = true;

// 쿼리가 취소되면 실제 fetch처럼 즉시 중단되도록 AbortSignal을 받는다. (study/api.ts와 동일 패턴)
const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

// 닉네임·사진·로그인 수단은 서버 값이고, 서버에 없는 요금제·알림 설정은 목에서 채운다.
// 알림 설정은 복사본을 줘야 목 쓰기 헬퍼가 고친 뒤 다시 조회할 때 참조가 바뀐다.
function toMyProfile(res: UserProfileResponse): MyProfile {
  const provider: User['provider'] =
    res.socialProvider === 'GOOGLE' ? 'GOOGLE' : 'KAKAO';
  return {
    userId: res.memberId,
    email: '',
    nickname: res.nickname,
    provider,
    profileImage: res.profileImageUrl,
    plan: mockMyProfile.plan,
    notifications: { ...mockMyProfile.notifications },
  };
}

// 내 정보 조회 — 프로필 화면 한 장에 필요한 것 전부. 사이드바도 이걸 쓴다.
export async function getMyProfile(signal?: AbortSignal): Promise<MyProfile> {
  const res = await apiClient.get<UserProfileResponse>('/users/me/profile', {
    signal,
  });
  return toMyProfile(res);
}

// 닉네임 수정 (프로필 수정 화면)
export async function updateNickname(nickname: string): Promise<MyProfile> {
  const trimmed = nickname.trim();
  // 형식 검사는 mock/실서버 어느 쪽이든 같아야 하므로 분기 밖에 둔다.
  if (!trimmed) throw new Error('닉네임을 입력해 주세요.');

  // profileImageUrl을 빼고 보내면 서버가 기존 사진을 그대로 둔다.
  const res = await apiClient.patch<UserProfileResponse>('/users/me/profile', {
    nickname: trimmed,
  });
  return toMyProfile(res);
}

// 알림 설정 변경 — 토글이라 저장 버튼 없이 바로 반영된다.
export async function updateNotifications(
  notifications: NotificationSettings,
): Promise<NotificationSettings> {
  if (USE_MOCK) {
    await delay(300);
    updateMockNotifications(notifications);
    return { ...notifications };
  }
  return apiClient.patch<NotificationSettings>(
    '/users/me/notifications',
    notifications,
  );
}

// 로그아웃 — 서버 세션 정리는 백엔드 확정 후 붙인다. 토큰 제거는 호출처가 한다.
export async function logout(): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    return;
  }
  await apiClient.post<void>('/auth/logout');
}

// 회원탈퇴
// TODO: 백엔드 엔드포인트 확정 시 경로 재확인 필요
export async function withdraw(): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    return;
  }
  await apiClient.delete<void>('/users/me');
}
