'use client';
// src/features/settings/components/ProfileEditScreen.tsx
import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { checkNickname } from '@/features/auth/api';
import {
  useMyProfile,
  useUpdateNickname,
} from '@/features/settings/hooks/useMyProfile';
import { DEFAULT_AVATAR } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { Input } from '@/shared/ui/Input';

// 로딩·에러 문구도 본문과 같은 폭에 둔다 — 전체 폭이면 데이터가 도착하는 순간 콘텐츠가 가로로 튄다.
// 폭은 globals.css의 read-col이 갖는다 — 값과 그 값을 고른 이유가 거기 있다.
const PAGE_SHELL = 'read-col py-12';

// 중복확인 결과 (온보딩 NicknameStep과 같은 3상태)
type NicknameStatus = 'idle' | 'available' | 'taken';

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
    return <div className={`${PAGE_SHELL} text-gray-500`}>불러오는 중…</div>;
  }
  if (isError || !profile) {
    return (
      <div className={`${PAGE_SHELL} text-gray-500`}>
        내 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  // null이면 아직 손대지 않은 것 — 서버 값을 그대로 보여준다.
  const value = nickname ?? profile.nickname;
  const changed = value.trim() !== profile.nickname;
  // 시안에서는 "사용 중"인데도 수정하기가 켜져 있지만, 그대로 저장하면 서버가 거절한다.
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
      setFormError('중복을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.');
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
          error.message || '저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        ),
    });
  };

  return (
    // 시안에서 이 화면은 프로필 화면보다 아래에 놓인다. 고정 여백으로 박으면 낮은 화면에서
    // 잘리므로 세로 가운데 정렬로 두고 위아래 최소 여백만 지킨다.
    <form
      onSubmit={handleSubmit}
      className={`${PAGE_SHELL} flex min-h-screen flex-col justify-center`}
    >
      {/* 아바타 + 편집 뱃지 */}
      <div className="relative self-center">
        <div className="size-[110px] overflow-hidden rounded-full">
          {/* 이 화면에서도 아바타가 LCP로 잡힌다 (ProfileScreen과 동일) */}
          <Image
            src={profile.profileImage ?? DEFAULT_AVATAR}
            alt=""
            width={110}
            height={110}
            unoptimized
            priority
            className="size-full object-cover"
          />
        </div>
        {/* 시안은 33px 어두운 원이었다. §2에 어두운 표면이 없어 2순위(흰 바탕 + 테두리)로
            간다 — 아바타 위에 얹히는 자리라 테두리가 경계를 만들어 준다.
            크기는 IconButton이 정한다: 글리프 16의 두 배인 32(§4). 이미지 업로드
            플로우가 시안에 없어 눌러도 상태만 알린다. */}
        <div className="absolute right-0 bottom-0">
          <IconButton
            name="edit"
            aria-label="프로필 사진 변경"
            rank="secondary"
            onClick={() => setNotice('프로필 사진 변경은 준비 중이에요.')}
          />
        </div>
      </div>
      {notice && (
        <p
          role="status"
          className="text-body-sm mt-4 self-center text-gray-500"
        >
          {notice}
        </p>
      )}

      {/* 닉네임 — 칸과 중복확인은 형제다. 시안은 버튼을 칸 안에 넣었는데, §4가 필드의
          채움을 필드 자체로 정해 둬서 그 안에 채움을 하나 더 넣으면 무엇이 칸인지
          흐려진다. Input은 라벨과 틀림 문구까지 들고 있으므로 배치만 여기서 한다. */}
      <div className="mt-12 flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <Input
            id="profile-nickname"
            label="닉네임"
            value={value}
            onChange={(e) => {
              setNickname(e.target.value);
              // 글자가 바뀌면 이전 확인 결과는 더 이상 이 닉네임의 것이 아니다.
              setStatus('idle');
            }}
            placeholder="닉네임을 입력해 주세요."
            disabled={updateMutation.isPending}
            error={status === 'taken' ? '사용 중인 닉네임이에요.' : undefined}
          />
        </div>
        <Button
          rank="secondary"
          onClick={handleCheck}
          disabled={!changed || updateMutation.isPending}
        >
          중복확인
        </Button>
      </div>

      {/* 쓸 수 있다는 말은 틀림이 아니라 상태다 — §2의 sky-ink가 "글자만으로 된 상태"다.
          틀림(사용 중)은 Input이 자기 error로 그린다. */}
      {status === 'available' && (
        <p role="status" className="text-body-sm text-sky-ink mt-2">
          사용 가능한 닉네임이에요.
        </p>
      )}

      {formError && (
        <p role="alert" className="text-body-sm text-red-ink mt-3">
          {formError}
        </p>
      )}

      {/* 시안은 366×76 두 개가 폭을 반씩 나눈다. §4는 버튼 폭을 라벨이 정한다고 두었고
          (순위는 채움과 위치가 말한다), 이 앱의 모든 폼이 오른쪽 끝에 취소·확정 순으로
          선다 — FormModal의 푸터와 같은 줄이다. */}
      <div className="mt-12 flex items-center justify-end gap-3">
        <Button
          rank="secondary"
          onClick={() => router.push('/settings/profile')}
          disabled={updateMutation.isPending}
        >
          취소
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {updateMutation.isPending ? '수정 중…' : '수정하기'}
        </Button>
      </div>
    </form>
  );
}
