// src/mocks/share.ts — 강의 공유 mock
import type { ProjectShare, ShareMember } from '@/shared/types/api';

// 공유 인원 상한. 기획서 기준 한 강의당 최대 3명이다.
export const MOCK_MAX_MEMBERS = 3;

// 강의(projectId)별 공유 멤버. 시안(1:3135)은 2/3이 찬 상태를 보여주므로 기본값도 2명으로 둔다.
// 상한에 걸린 상태(3/3)와 빈 상태를 둘 다 확인할 수 있게 강의마다 다르게 채웠다.
const membersByProject: Record<string, ShareMember[]> = {
  '1': [
    { userId: 'u1', nickname: '김대학', email: 'university@univ.ac.kr' },
    { userId: 'u2', nickname: '이한양', email: 'hanyang@univ.ac.kr' },
  ],
  '2': [
    { userId: 'u1', nickname: '김대학', email: 'university@univ.ac.kr' },
    { userId: 'u3', nickname: '박구름', email: 'cloud@univ.ac.kr' },
    { userId: 'u4', nickname: '최번개', email: 'flash@univ.ac.kr' },
  ],
};

// 아직 아무도 초대하지 않은 강의는 빈 목록으로 시작한다.
export function getMockShare(projectId: string): ProjectShare {
  return {
    projectId,
    members: [...(membersByProject[projectId] ?? [])],
    maxMembers: MOCK_MAX_MEMBERS,
  };
}

// mock 전용 쓰기 헬퍼. 새로고침하면 사라진다(모듈 메모리라 세션 단위).

export function addMockShareMember(
  projectId: string,
  member: ShareMember,
): void {
  const members = (membersByProject[projectId] ??= []);
  if (members.length >= MOCK_MAX_MEMBERS) {
    throw new Error(`공유는 최대 ${MOCK_MAX_MEMBERS}명까지 가능해요.`);
  }
  // 같은 사람을 두 번 초대하면 목록에 중복으로 쌓인다. 이메일로 막는다.
  if (members.some((m) => m.email === member.email)) {
    throw new Error('이미 공유 중인 사용자예요.');
  }
  members.push(member);
}

export function removeMockShareMember(projectId: string, userId: string): void {
  const members = membersByProject[projectId];
  const index = members?.findIndex((m) => m.userId === userId) ?? -1;
  if (!members || index === -1) {
    throw new Error('제거할 사용자를 찾지 못했어요.');
  }
  members.splice(index, 1);
}
