// src/features/auth/api.ts
import type {
  LoginResponse,
  NicknameCheckResponse,
  OnboardingProfileRequest,
  User,
} from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import { mockLoginResponse } from '@/mocks/auth';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
const USE_MOCK = true;

// 가짜 지연을 흉내내는 헬퍼 (실제 네트워크처럼 잠깐 기다림)
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 소셜 로그인 제공자. User.provider에서 이메일을 뺀 값과 항상 일치시킨다.
export type SocialProvider = Exclude<User['provider'], 'EMAIL'>;

// 소셜 로그인 시작
export async function startSocialLogin(
  provider: SocialProvider,
): Promise<LoginResponse> {
  if (USE_MOCK) {
    await delay(300); // 로딩 상태 확인용
    return mockLoginResponse;
  }

  // TODO: 백엔드 OAuth 스펙 확정 후 연결.
  // 인가 코드 방식이면 fetch가 아니라 백엔드 인가 URL로 브라우저를 넘기고,
  // 콜백 라우트에서 토큰을 받아야 한다. 그때 이 함수의 반환 타입도 다시 본다.
  //   window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/${provider.toLowerCase()}`;
  throw new Error(`${provider} 소셜 로그인은 백엔드 연동 준비 중입니다.`);
}

// 닉네임 중복 확인
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

// 로그인 성공 후 토큰 저장 자리.
// apiClient가 localStorage의 accessToken을 읽어 Authorization 헤더에 싣는다.
// TODO: 백엔드 응답 형태 확정 후 실제 저장으로 교체 (저장 위치도 함께 재검토)
// tokens는 실연동 시 저장에 쓰인다. 지금은 mock 경로만 실행돼 미사용이라 규칙을 잠시 끈다.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function saveAuthTokens(tokens: LoginResponse): void {
  if (USE_MOCK) {
    // 토큰 값은 로그로 남기지 않는다 (실연동 시 민감정보 노출 방지)
    console.log('[mock] 토큰 저장 호출됨');
    return;
  }
  // localStorage.setItem('accessToken', tokens.accessToken);
  // localStorage.setItem('refreshToken', tokens.refreshToken);
}
