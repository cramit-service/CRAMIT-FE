'use client';
// src/features/settings/components/ProfileScreen.tsx
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { PlanId } from '@/shared/types/api';
import { DEFAULT_AVATAR } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/Button';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
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
// 폭은 globals.css의 read-col이 갖는다 — 값과 그 값을 고른 이유가 거기 있다.
const PAGE_SHELL = 'read-col pt-[83px] pb-[67px]';

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
        <Button rank="secondary" onClick={() => refetch()}>
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
      <div className="size-[110px] overflow-hidden rounded-full">
        {/* 이 화면 최상단이라 아바타가 LCP로 잡힌다. priority로 미리 받아 Next 경고를 없애고
            늦게 채워지는 것도 막는다. (홈 배너 #35와 같은 처리) */}
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
      <h1 className="text-heading-md mt-2 font-semibold text-gray-800">
        {profile.nickname}
      </h1>
      {/* 시안은 gray-400 채움이었다. §4는 회색 채움을 비활성에만 허락한다 —
          강의 목록에서 같은 채움을 이미 걷어냈다. 이 화면에서 유일한 이동이라
          2순위(테두리)가 맞다. 폭은 라벨이 정한다(§4). */}
      <div className="mt-6">
        <Button href="/settings/profile/edit" rank="secondary">
          내 정보 수정
        </Button>
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
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
            <p role="alert" className="text-body-sm text-red-ink">
              알림 설정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}
        </SettingSection>

        <SettingSection title="요금제">
          <SettingRow label={PLAN_LABEL[profile.plan]}>
            {/* 채움이 bg-secondary-400이라 토큰에 없어 투명하게 렌더되고, 글자도
                gray-950이 죽어 어두운 판 위에서 1.38:1이었다 — 버튼이 사실상 없었다. */}
            <Button rank="secondary" onClick={() => setPlanNotice(true)}>
              플랜 변경
            </Button>
          </SettingRow>
          {/* 요금제 변경 화면이 시안에 없다. 버튼은 시안대로 두고 눌렀을 때 상태만 알린다. */}
          {planNotice && (
            <p role="status" className="text-body text-gray-600">
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
            <p role="alert" className="text-body-sm text-red-ink">
              {actionError}
            </p>
          )}
        </SettingSection>
      </div>

      {/* 시안에 확인 단계가 없지만 되돌릴 수 없는 동작이라 한 번 묻는다.
          Modal을 직접 쓰고 제목·여백·버튼을 손으로 그리고 있었다 — ConfirmModal이
          정확히 이 모양(물음 하나 + 취소 + 되돌릴 수 없는 동작)이고, §4가 정한
          여백 48과 물음 24도 그쪽이 들고 있다. */}
      <ConfirmModal
        open={withdrawOpen}
        question="정말 탈퇴할까요?"
        detail="탈퇴하면 만든 강의와 학습 기록이 모두 사라지고 되돌릴 수 없어요."
        confirmLabel="탈퇴하기"
        danger
        busy={leaving}
        onConfirm={() =>
          leave(withdraw, '탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요.')
        }
        onClose={() => setWithdrawOpen(false)}
      />
    </div>
  );
}
