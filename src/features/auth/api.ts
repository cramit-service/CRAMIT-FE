// src/features/auth/api.ts
import type {
  NicknameCheckResponse,
  OnboardingProfileRequest,
  User,
} from '@/shared/types/api';
import { apiClient, BASE_URL } from '@/shared/lib/apiClient';
import { setAccessToken } from '@/shared/lib/authToken';
import { mockLoginResponse } from '@/mocks/auth';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = true;
// 로그인은 백엔드에 붙었다. 닉네임 확인·온보딩 등록은 API가 아직 없어 위 스위치로 mock에 둔다.
const USE_MOCK_LOGIN = false;

// 가짜 지연을 흉내내는 헬퍼 (실제 네트워크처럼 잠깐 기다림)
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 소셜 로그인 제공자. User.provider에서 이메일을 뺀 값과 항상 일치시킨다.
export type SocialProvider = Exclude<User['provider'], 'EMAIL'>;

// 인가는 백엔드가 처리하고 /oauth/callback?accessToken=… 으로 돌려보낸다.
const oauthAuthorizeUrl = (provider: SocialProvider) =>
  `${BASE_URL}/oauth2/authorization/${provider.toLowerCase()}`;

// 브라우저를 백엔드 인가 주소로 넘긴다. mock은 백엔드 대신 콜백으로 바로 돌아온다.
export async function startSocialLogin(
  provider: SocialProvider,
): Promise<void> {
  if (USE_MOCK_LOGIN) {
    await delay(300); // 로딩 상태 확인용
    window.location.assign(
      `/oauth/callback?accessToken=${mockLoginResponse.accessToken}&isNewUser=true`,
    );
    return;
  }

  window.location.assign(oauthAuthorizeUrl(provider));
}

// 콜백 쿼리의 토큰을 저장하고 다음 경로를 돌려준다. 토큰이 없으면 실패로 보고 null.
export function completeSocialLogin(params: URLSearchParams): string | null {
  const accessToken = params.get('accessToken');
  if (!accessToken) return null;

  setAccessToken(accessToken);
  // TODO: 백엔드가 아직 isNewUser를 보내지 않아 기존 회원도 온보딩으로 간다
  return params.get('isNewUser') === 'false' ? '/home' : '/onboarding';
}

export async function checkNickname(
  nickname: string,
): Promise<NicknameCheckResponse> {
  if (USE_MOCK) {
    await delay(300); // 로딩 상태 확인용
    // mock 규칙: '김한양'만 이미 사용 중이고 나머지는 모두 사용 가능
    return { available: nickname.trim() !== '김한양' };
  }

  // TODO: 백엔드 스펙 확정 후 경로·쿼리 파라미터명 재확인
  return apiClient.get<NicknameCheckResponse>(
    `/users/check-nickname?nickname=${encodeURIComponent(nickname)}`,
  );
}

// 온보딩 완료 시 프로필 등록 (약관 동의 + 닉네임 + 요금제)
export async function registerOnboardingProfile(
  payload: OnboardingProfileRequest,
): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    console.log('[mock] 온보딩 프로필 등록', payload);
    return;
  }

  // TODO: 백엔드 스펙 확정 후 연결. 엔드포인트와 필드명 모두 미정이며,
  // 요금제가 별도 API로 분리될 가능성도 있어 확인 필요.
  await apiClient.post<void>('/users/profile', payload);
}
