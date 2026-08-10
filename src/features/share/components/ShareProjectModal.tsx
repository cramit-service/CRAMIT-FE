'use client';
// src/features/share/components/ShareProjectModal.tsx
import { useId, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { FIELD_BASE, FormModal, HINT, LABEL } from '@/shared/ui/FormModal';
import type { ShareMember } from '@/shared/types/api';
import {
  useInviteShareMember,
  useProjectShare,
  useRemoveShareMember,
} from '@/features/share/hooks/useProjectShare';

interface ShareProjectModalProps {
  projectId: string;
  onClose: () => void;
}

// 초대 입력만 흰 배경이다 — 다른 다크 모달의 채워진 입력(gray-800)과 달리
// 시안에서 이 칸은 밝게 떠 있어 "여기에 쓰라"는 신호를 준다.
const INVITE_FIELD = `${FIELD_BASE} min-w-0 flex-1 bg-gray-100 text-gray-950 placeholder:text-gray-500 focus:ring-1 focus:ring-secondary-400`;

// 강의 공유하기 모달. 시안: Figma `내 강의-상세보기-공유하기` (1:3135).
export function ShareProjectModal({
  projectId,
  onClose,
}: ShareProjectModalProps) {
  const fieldId = useId();
  const shareQuery = useProjectShare(projectId);
  const inviteMutation = useInviteShareMember(projectId);
  const removeMutation = useRemoveShareMember(projectId);

  const [identifier, setIdentifier] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const share = shareQuery.data;
  const members = share?.members ?? [];
  const maxMembers = share?.maxMembers ?? 0;
  const isFull = share !== undefined && members.length >= maxMembers;
  const busy = inviteMutation.isPending || removeMutation.isPending;
  // 목록을 못 받은 상태에서는 몇 명이 차 있는지 모른다. 그대로 초대를 열어 두면
  // 상한(3명)을 넘겨 부르고 서버 에러로만 알게 된다. 조회가 끝나야 초대를 연다.
  const canInvite = shareQuery.isSuccess && share !== undefined;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInvite || busy || isFull || identifier.trim() === '') return;
    setFormError(null);

    inviteMutation.mutate(identifier, {
      // 초대에 성공하면 입력칸을 비워 다음 사람을 바로 부를 수 있게 한다.
      onSuccess: () => setIdentifier(''),
      onError: (error) =>
        setFormError(
          error.message || '초대에 실패했어요. 잠시 후 다시 시도해 주세요.',
        ),
    });
  };

  const handleRemove = (member: ShareMember) => {
    if (busy) return;
    setFormError(null);
    removeMutation.mutate(member.userId, {
      onError: (error) =>
        setFormError(
          error.message || '제거에 실패했어요. 잠시 후 다시 시도해 주세요.',
        ),
    });
  };

  return (
    <FormModal
      title="내 강의 공유하기"
      titleVisible
      onClose={onClose}
      onSubmit={handleInvite}
      busy={busy}
    >
      {/* 친구 초대 */}
      <label htmlFor={`${fieldId}-invite`} className={cn(LABEL, 'mt-2')}>
        친구 초대로 강의 공유하기
      </label>
      <div className="mt-2 flex items-center gap-2">
        <input
          id={`${fieldId}-invite`}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="이메일 또는 @닉네임을 작성해주세요."
          disabled={!canInvite || busy || isFull}
          className={INVITE_FIELD}
        />
        {/* 입력칸과 같은 높이로 붙는 확정 액션이라 하늘색(secondary) */}
        <button
          type="submit"
          disabled={!canInvite || busy || isFull || identifier.trim() === ''}
          className="enabled:bg-secondary-400 enabled:hover:bg-secondary-500 h-10 w-[78px] shrink-0 rounded-md text-[13px] leading-5 font-medium tracking-[-0.26px] transition-colors enabled:text-gray-950 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
        >
          {inviteMutation.isPending ? '초대 중…' : '초대하기'}
        </button>
      </div>
      <p className={cn(HINT, 'mt-2 text-gray-500')}>
        친구를 초대하면 친구의 &lsquo;공유 강의&rsquo;에 추가되고, 함께 쓰는
        공유 게시판을 사용할 수 있어요.
      </p>

      {/* 초대 실패는 사용자가 방금 누른 결과라 보조기기가 바로 읽어야 한다. */}
      {formError && (
        <p role="alert" className={cn(HINT, 'text-error mt-2')}>
          {formError}
        </p>
      )}

      {/* 공유 중인 사용자 */}
      <h3 className={cn(LABEL, 'mt-8')}>
        공유 중인 사용자 현재 ({members.length}/{maxMembers})
      </h3>

      <div className="mt-3 flex flex-col gap-2.5">
        {shareQuery.isPending ? (
          <p className={cn(HINT, 'text-gray-500')}>
            공유 정보를 불러오는 중이에요.
          </p>
        ) : shareQuery.isError || !share ? (
          <p role="alert" className={cn(HINT, 'text-error')}>
            공유 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        ) : members.length === 0 ? (
          <p className={cn(HINT, 'text-gray-500')}>
            아직 공유 중인 사용자가 없어요. 친구를 초대해 보세요.
          </p>
        ) : (
          members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center gap-3 rounded-md bg-gray-800 px-4 py-3.5"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="truncate text-[14px] leading-5 font-semibold tracking-[-0.28px] text-gray-100">
                  {member.nickname}
                </span>
                {/* 이메일은 이름보다 한 단계 낮은 정보라 테두리 칩으로 눌러 둔다 */}
                <span className="w-fit max-w-full truncate rounded-sm border-[0.5px] border-gray-600 px-1.5 py-0.5 text-[11px] leading-4 tracking-[-0.22px] text-gray-400">
                  {member.email}
                </span>
              </div>
              {/* 위험 액션이지만 행 안의 보조 버튼이라 채운 빨강 대신 옅게 깐다 */}
              <button
                type="button"
                onClick={() => handleRemove(member)}
                disabled={busy}
                className="bg-error/20 text-error shrink-0 rounded-sm px-2 py-0.5 text-[11px] leading-4 font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                제거하기
              </button>
            </div>
          ))
        )}

        {/* 상한에 걸리면 입력칸이 막힌다. 왜 막혔는지 알려주지 않으면 고장으로 보인다. */}
        {isFull && (
          <p className={cn(HINT, 'text-gray-500')}>
            공유는 최대 {maxMembers}명까지 가능해요. 한 명을 제거하면 새로
            초대할 수 있어요.
          </p>
        )}
      </div>
    </FormModal>
  );
}
