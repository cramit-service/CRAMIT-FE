// src/features/auth/api.ts
import type {
  NicknameCheckResponse,
  OnboardingProfileRequest,
  Term,
  User,
} from '@/shared/types/api';
import { apiClient, BASE_URL } from '@/shared/lib/apiClient';
import { setAccessToken } from '@/shared/lib/authToken';
import { mockLoginResponse, mockTerms } from '@/mocks/auth';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = false;

// 가짜 지연을 흉내내는 헬퍼 (실제 네트워크처럼 잠깐 기다림)
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 소셜 로그인 제공자. User.provider에서 이메일을 뺀 값과 항상 일치시킨다.
export type SocialProvider = Exclude<User['provider'], 'EMAIL'>;

// 소셜 로그인 시작 주소. 인가는 백엔드가 처리하고 /oauth/callback?accessToken=… 으로 돌려보낸다.
// mock은 백엔드 대신 콜백으로 바로 돌아온다.
export function socialLoginHref(provider: SocialProvider): string {
  if (USE_MOCK) {
    return `/oauth/callback?accessToken=${mockLoginResponse.accessToken}&isNewUser=true`;
  }
  return `${BASE_URL}/oauth2/authorization/${provider.toLowerCase()}`;
}

// 콜백 쿼리의 토큰을 저장하고 다음 경로를 돌려준다. 토큰이 없으면 실패로 보고 null.
export function completeSocialLogin(params: URLSearchParams): string | null {
  const accessToken = params.get('accessToken');
  if (!accessToken) return null;

  setAccessToken(accessToken);
  // isNewUser는 "온보딩 미완료"다. 가입만 하고 중간에 나간 회원도 true로 온다.
  return params.get('isNewUser') === 'false' ? '/home' : '/onboarding';
}

export async function checkNickname(
  nickname: string,
): Promise<NicknameCheckResponse> {
  // 서버는 공백을 지우지 않고 그대로 비교한다.
  const trimmed = nickname.trim();

  if (USE_MOCK) {
    await delay(300); // 로딩 상태 확인용
    // mock 규칙: '김한양'만 이미 사용 중이고 나머지는 모두 사용 가능
    return { available: trimmed !== '김한양' };
  }

  return apiClient.get<NicknameCheckResponse>(
    `/users/check-nickname?nickname=${encodeURIComponent(trimmed)}`,
  );
}

export async function getTerms(signal?: AbortSignal): Promise<Term[]> {
  if (USE_MOCK) {
    await delay(300);
    return mockTerms;
  }

  const terms = await apiClient.get<Term[]>('/terms', { signal });
  // 서버 조회에 정렬이 없어 순서가 보장되지 않는다.
  return terms.sort((a, b) => a.termId - b.termId);
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

  await apiClient.post<void>('/users/me/onboarding', {
    ...payload,
    nickname: payload.nickname.trim(),
  });
}
