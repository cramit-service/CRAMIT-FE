'use client';
// src/features/settings/components/ProfileScreen.tsx
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { PlanId } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Switch } from '@/shared/ui/Switch';
import { logout, withdraw } from '@/features/settings/api';
import {
  useMyProfile,
  useUpdateNotifications,
} from '@/features/settings/hooks/useMyProfile';
import {
  SettingLinkRow,
  SettingRow,
  SettingSection,
} from '@/features/settings/components/SettingRow';

// 로딩·에러 문구도 본문과 같은 폭에 둔다 — 전체 폭이면 데이터가 도착하는 순간 콘텐츠가 가로로 튄다.
const PAGE_SHELL = 'mx-auto w-full max-w-[538px] px-6 pt-15 pb-12';

// 요금제 표기. PlanId는 코드값이라 화면에는 사람이 읽는 이름을 쓴다.
const PLAN_LABEL: Record<PlanId, string> = {
  FREE: 'Free Plan',
  STANDARD: 'Standard Plan',
  PRO: 'Pro Plan',
};

// 대시보드-프로필 화면. 시안: Figma 1:5126.
// 홈 화면과 마찬가지로 글자를 시안 px 그대로 쓰므로 상자 값도 1:1로 옮긴다 (CLAUDE.md 4-4).
export function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile, isPending, isError, refetch } = useMyProfile();
  const notificationMutation = useUpdateNotifications();

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [planNotice, setPlanNotice] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isPending) {
    return <div className={`${PAGE_SHELL} text-gray-500`}>불러오는 중…</div>;
  }

  if (isError || !profile) {
    return (
      <div className={`${PAGE_SHELL} flex flex-col items-start gap-4`}>
        <p className="text-gray-700">
          내 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }

  const { notifications } = profile;

  const toggle = (key: keyof typeof notifications) => (next: boolean) => {
    notificationMutation.mutate({ ...notifications, [key]: next });
  };

  // 로그인 화면으로 돌려보내기 전에 캐시를 비운다. 남겨두면 다음 사용자가
  // 로그인했을 때 이전 사람의 강의·TODO가 한 프레임 스쳐 지나간다.
  const leave = async (run: () => Promise<void>, failMessage: string) => {
    if (leaving) return;
    setLeaving(true);
    setActionError(null);
    try {
      await run();
      queryClient.clear();
      router.push('/');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : failMessage);
      setLeaving(false);
    }
  };

  return (
    <div className={`${PAGE_SHELL} flex flex-col items-center`}>
      {/* 아바타 + 닉네임 + 수정 버튼 */}
      {/* 시안 아바타(110)는 사각 프레임으로 내보내져 배경이 함께 온다. 원형으로 잘라 쓴다. */}
      <div className="size-[79px] overflow-hidden rounded-full">
        {/* 이 화면 최상단이라 아바타가 LCP로 잡힌다. priority로 미리 받아 Next 경고를 없애고
            늦게 채워지는 것도 막는다. (홈 배너 #35와 같은 처리) */}
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
      <h1 className="mt-1.5 text-[24px] leading-8 font-semibold tracking-[-0.48px] text-gray-950">
        {profile.nickname}
      </h1>
      {/* 시안은 gray-400 바탕에 밝은 글자다(비활성 버튼과 같은 색). 눌리는 버튼이라는 게
          드러나도록 hover만 더했다. */}
      <Link
        href="/settings/profile/edit"
        className="text-primary-100 mt-4.5 flex h-8 w-18 items-center justify-center rounded-md bg-gray-400 text-[12px] leading-4.5 font-medium tracking-[-0.24px] transition-colors hover:bg-gray-500"
      >
        내 정보 수정
      </Link>

      <div className="mt-7 flex w-full flex-col gap-6">
        <SettingSection title="알림 설정">
          <SettingRow labelId="notify-ai" label="AI 분석 완료 알림">
            <Switch
              checked={notifications.aiAnalysisDone}
              onChange={toggle('aiAnalysisDone')}
              labelledBy="notify-ai"
            />
          </SettingRow>
          <SettingRow labelId="notify-todo" label="TODO 마감일 알림">
            <Switch
              checked={notifications.todoDueDate}
              onChange={toggle('todoDueDate')}
              labelledBy="notify-todo"
            />
          </SettingRow>
          {notificationMutation.isError && (
            <p role="alert" className="text-error text-[13px] leading-5">
              알림 설정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}
        </SettingSection>

        <SettingSection title="요금제">
          <SettingRow label={PLAN_LABEL[profile.plan]}>
            {/* 시안 97×46 → 0.72배 70×33 */}
            <button
              type="button"
              onClick={() => setPlanNotice(true)}
              className="bg-secondary-400 hover:bg-secondary-500 flex h-[33px] w-[70px] items-center justify-center rounded-md text-[13px] leading-5 font-medium tracking-[-0.26px] text-gray-950 transition-colors"
            >
              플랜 변경
            </button>
          </SettingRow>
          {/* 요금제 변경 화면이 시안에 없다. 버튼은 시안대로 두고 눌렀을 때 상태만 알린다. */}
          {planNotice && (
            <p role="status" className="text-[13px] leading-5 text-gray-600">
              요금제 변경은 준비 중이에요.
            </p>
          )}
        </SettingSection>

        <SettingSection title="계정 설정">
          <SettingLinkRow
            label="로그아웃"
            disabled={leaving}
            onClick={() =>
              leave(
                logout,
                '로그아웃에 실패했어요. 잠시 후 다시 시도해 주세요.',
              )
            }
          />
          <SettingLinkRow
            label="회원탈퇴"
            danger
            disabled={leaving}
            onClick={() => setWithdrawOpen(true)}
          />
          {actionError && (
            <p role="alert" className="text-error text-[13px] leading-5">
              {actionError}
            </p>
          )}
        </SettingSection>
      </div>

      {/* 시안에 확인 단계가 없지만 되돌릴 수 없는 동작이라 한 번 묻는다. */}
      <Modal
        open={withdrawOpen}
        onClose={() => !leaving && setWithdrawOpen(false)}
        labelledBy="withdraw-title"
      >
        <h2
          id="withdraw-title"
          className="text-[18px] leading-7 font-semibold tracking-[-0.36px] text-gray-950"
        >
          정말 탈퇴할까요?
        </h2>
        <p className="mt-2 text-[14px] leading-[22px] text-gray-600">
          탈퇴하면 만든 강의와 학습 기록이 모두 사라지고 되돌릴 수 없어요.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={leaving}
            onClick={() => setWithdrawOpen(false)}
          >
            취소
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={leaving}
            onClick={() =>
              leave(withdraw, '탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요.')
            }
          >
            {leaving ? '처리 중…' : '탈퇴하기'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
