'use client';
// src/features/settings/components/ProfileEditScreen.tsx
import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { checkNickname } from '@/features/auth/api';
import {
  useMyProfile,
  useUpdateNickname,
} from '@/features/settings/hooks/useMyProfile';

// 중복확인 결과 (온보딩 NicknameStep과 같은 3상태)
type NicknameStatus = 'idle' | 'available' | 'taken';

// 시안 747×76 입력 → 0.72배 538×55. 상태에 따라 테두리 색만 갈린다.
const BORDER_BY_STATUS: Record<NicknameStatus, string> = {
  idle: 'border-gray-800',
  available: 'border-secondary-400',
  taken: 'border-error',
};

// 대시보드-프로필-수정 화면. 시안: Figma 1:5164 / 1:5196.
export function ProfileEditScreen() {
  const router = useRouter();
  const { data: profile, isPending, isError } = useMyProfile();
  const updateMutation = useUpdateNickname();

  const [nickname, setNickname] = useState<string | null>(null);
  const [status, setStatus] = useState<NicknameStatus>('idle');
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  // 응답을 기다리는 동안 연타로 중복 호출되지 않게 막는다 (NicknameStep과 동일)
  const isChecking = useRef(false);

  if (isPending) {
    return <div className="p-10 text-gray-500">불러오는 중…</div>;
  }
  if (isError || !profile) {
    return (
      <div className="p-10 text-gray-500">
        내 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  // null이면 아직 손대지 않은 것 — 서버 값을 그대로 보여준다.
  const value = nickname ?? profile.nickname;
  const changed = value.trim() !== profile.nickname;
  // 시안에서는 "사용 중"인데도 수정 완료가 켜져 있지만, 그대로 저장하면 서버가 거절한다.
  // 온보딩과 같이 중복확인을 통과해야 저장을 연다.
  const canSubmit =
    changed && status === 'available' && !updateMutation.isPending;

  const handleCheck = async () => {
    if (!changed || isChecking.current) return;
    isChecking.current = true;
    setFormError(null);
    try {
      const { available } = await checkNickname(value);
      setStatus(available ? 'available' : 'taken');
    } catch {
      setStatus('idle');
      setFormError('중복 확인에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      isChecking.current = false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setFormError(null);
    updateMutation.mutate(value.trim(), {
      onSuccess: () => router.push('/settings/profile'),
      onError: (error) =>
        setFormError(
          error.message || '저장에 실패했어요. 잠시 후 다시 시도해 주세요.',
        ),
    });
  };

  return (
    // 시안에서 이 화면은 프로필 화면보다 아래에 놓인다. 고정 여백으로 박으면 낮은 화면에서
    // 잘리므로 세로 가운데 정렬로 두고 위아래 최소 여백만 지킨다.
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex min-h-screen w-full max-w-[538px] flex-col justify-center px-6 py-12"
    >
      {/* 아바타 + 편집 뱃지 */}
      <div className="relative self-center">
        <div className="size-[79px] overflow-hidden rounded-full">
          {/* 이 화면에서도 아바타가 LCP로 잡힌다 (ProfileScreen과 동일) */}
          <Image
            src={profile.profileImage ?? '/images/avatar-default.svg'}
            alt=""
            width={110}
            height={110}
            unoptimized
            priority
            className="size-full object-cover"
          />
        </div>
        {/* 시안 33×33 → 0.72배 24. 이미지 업로드 플로우가 시안에 없어 상태만 알린다. */}
        <button
          type="button"
          onClick={() => setNotice('프로필 사진 변경은 준비 중이에요.')}
          aria-label="프로필 사진 변경"
          className="absolute right-0 bottom-0.5 flex size-6 items-center justify-center rounded-full bg-gray-800 text-gray-100 transition-colors hover:bg-gray-700"
        >
          <PencilIcon className="size-3" />
        </button>
      </div>
      {notice && (
        <p
          role="status"
          className="mt-3 self-center text-[13px] leading-5 text-gray-600"
        >
          {notice}
        </p>
      )}

      {/* 닉네임 */}
      <div className="mt-10.5 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-4">
          <label
            htmlFor="profile-nickname"
            className="text-[13px] leading-5 font-medium tracking-[-0.26px] text-gray-700"
          >
            닉네임
          </label>
          {status === 'available' && (
            <p className="text-secondary-400 text-[13px] leading-5 font-medium">
              사용 가능한 닉네임입니다.
            </p>
          )}
          {status === 'taken' && (
            <p
              role="alert"
              className="text-error text-[13px] leading-5 font-medium"
            >
              사용 중인 닉네임입니다.
            </p>
          )}
        </div>

        <div
          className={cn(
            'flex h-[55px] items-center gap-2.5 rounded-md border bg-gray-800 px-3.5 transition-colors',
            BORDER_BY_STATUS[status],
          )}
        >
          <input
            id="profile-nickname"
            value={value}
            onChange={(e) => {
              setNickname(e.target.value);
              // 글자가 바뀌면 이전 확인 결과는 더 이상 이 닉네임의 것이 아니다.
              setStatus('idle');
            }}
            placeholder="닉네임을 작성해주세요."
            disabled={updateMutation.isPending}
            className="min-w-0 flex-1 bg-transparent text-body-sm font-medium text-gray-100 placeholder:text-gray-500 focus:outline-none"
          />
          {/* 시안 93×46 → 0.72배 67×33 */}
          <button
            type="button"
            onClick={handleCheck}
            disabled={!changed || updateMutation.isPending}
            className="enabled:bg-secondary-400 enabled:hover:bg-secondary-500 flex h-[33px] w-[67px] shrink-0 items-center justify-center rounded-md text-[13px] leading-5 font-medium tracking-[-0.26px] transition-colors enabled:text-gray-950 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
          >
            중복확인
          </button>
        </div>
      </div>

      {formError && (
        <p role="alert" className="text-error mt-3 text-[13px] leading-5">
          {formError}
        </p>
      )}

      {/* 시안 366×76 두 개, 간격 15 → 0.72배 263×55, 간격 11 */}
      <div className="mt-10.5 grid grid-cols-2 gap-[11px]">
        <button
          type="button"
          onClick={() => router.push('/settings/profile')}
          disabled={updateMutation.isPending}
          className="flex h-[55px] items-center justify-center rounded-md border border-gray-400 bg-gray-100 text-[15px] leading-6 font-medium tracking-[-0.3px] text-gray-900 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          뒤로 가기
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="enabled:bg-secondary-400 enabled:hover:bg-secondary-500 flex h-[55px] items-center justify-center rounded-md text-[15px] leading-6 font-medium tracking-[-0.3px] transition-colors enabled:text-gray-950 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-100"
        >
          {updateMutation.isPending ? '저장 중…' : '수정 완료'}
        </button>
      </div>
    </form>
  );
}

// 아바타 편집 뱃지 안의 연필
function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 20h4l10-10a2.8 2.8 0 1 0-4-4L4 16v4Z" />
    </svg>
  );
}
