// src/features/share/api.ts
import type { ProjectShare, ShareMember } from '@/shared/types/api';
import { apiClient } from '@/shared/lib/apiClient';
import {
  addMockShareMember,
  getMockShare,
  removeMockShareMember,
} from '@/mocks/share';

// Mock 사용 여부 스위치 (백엔드 준비되면 false로)
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

// 강의 공유 상태 조회 — 공유 중인 멤버와 인원 상한.
// TODO: 백엔드 엔드포인트 확정 시 경로 재확인 필요
export async function getProjectShare(
  projectId: string,
  signal?: AbortSignal,
): Promise<ProjectShare> {
  if (USE_MOCK) {
    await delay(300, signal);
    return getMockShare(projectId);
  }
  return apiClient.get<ProjectShare>(`/projects/${projectId}/share`, {
    signal,
  });
}

// 초대 입력은 "이메일 또는 @닉네임" 한 칸이라 어느 쪽인지 여기서 가른다.
// 실제 백엔드에서도 문자열 하나를 보내고 서버가 해석하는 형태를 가정한다.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// mock 전용: 초대 문자열로 그럴듯한 멤버를 만든다.
// 서버가 붙으면 실제 사용자 조회 결과가 오므로 이 변환은 사라진다.
function mockMemberFrom(identifier: string): ShareMember {
  const trimmed = identifier.trim();
  if (trimmed.startsWith('@')) {
    const nickname = trimmed.slice(1);
    return {
      userId: `u${Date.now()}`,
      nickname,
      email: `${nickname}@univ.ac.kr`,
    };
  }
  return {
    userId: `u${Date.now()}`,
    nickname: trimmed.split('@')[0],
    email: trimmed,
  };
}

// 친구 초대 (Figma 1:3135)
export async function inviteShareMember(
  projectId: string,
  identifier: string,
): Promise<ShareMember> {
  const trimmed = identifier.trim();
  // 형식 검사는 mock/실서버 어느 쪽이든 같아야 하므로 분기 밖에 둔다.
  if (!trimmed) {
    throw new Error('이메일 또는 @닉네임을 입력해 주세요.');
  }
  if (!trimmed.startsWith('@') && !EMAIL.test(trimmed)) {
    throw new Error('이메일 형식이 올바르지 않아요. 닉네임은 @로 시작해요.');
  }

  if (USE_MOCK) {
    await delay(300);
    const member = mockMemberFrom(trimmed);
    // 상한 초과·중복은 mock 스토어가 판단해 에러를 던진다(서버 역할).
    addMockShareMember(projectId, member);
    return member;
  }
  return apiClient.post<ShareMember>(`/projects/${projectId}/share`, {
    identifier: trimmed,
  });
}

// 공유 사용자 제거
export async function removeShareMember(
  projectId: string,
  userId: string,
): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    removeMockShareMember(projectId, userId);
    return;
  }
  await apiClient.delete<void>(`/projects/${projectId}/share/${userId}`);
}
