'use client';
// src/features/auth/components/OnboardingFlow.tsx
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/shared/ui/Logo';
import { Button } from '@/shared/ui/Button';
import { TermsStep, REQUIRED_TERM_IDS } from './TermsStep';
import { NicknameStep, type NicknameStatus } from './NicknameStep';
import { PlanStep } from './PlanStep';
import { registerOnboardingProfile } from '@/features/auth/api';
import type { PlanId } from '@/shared/types/api';

type Step = 'terms' | 'nickname' | 'plan';

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('terms');

  // 스텝 전체가 공유하는 상태
  const [agreedTermIds, setAgreedTermIds] = useState<string[]>([]);
  const [nickname, setNickname] = useState('');
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>('idle');
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('FREE');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 필수 약관이 모두 동의돼야 다음으로 넘어간다 (선택 약관은 영향 없음)
  const canGoNext =
    step === 'terms'
      ? REQUIRED_TERM_IDS.every((id) => agreedTermIds.includes(id))
      : nicknameStatus === 'available';

  const handleBack = () => {
    // 실패 안내는 그 스텝에 매인 것이라 스텝을 벗어나면 지운다
    setFormError(null);

    if (step === 'terms') {
      router.push('/login');
      return;
    }
    setStep(step === 'plan' ? 'nickname' : 'terms');
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setStep(step === 'terms' ? 'nickname' : 'plan');
  };

  const handleComplete = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setFormError(null);

    try {
      await registerOnboardingProfile({
        nickname,
        agreedTermIds,
        plan: selectedPlan,
      });
      router.push('/home');
      // 성공하면 제출 상태를 풀지 않는다. 이동이 끝날 때까지 이 화면이 남아 있어서,
      // 여기서 풀면 '시작하기'가 잠깐 다시 눌리는 상태가 되고 등록이 두 번 나갈 수 있다.
    } catch (error) {
      // TODO: 공통 에러 토스트가 생기면 이 안내를 그쪽으로 옮긴다
      console.error('온보딩 프로필 등록 실패', error);
      setFormError('등록에 실패했어요. 잠시 후 다시 시도해 주세요.');
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col py-8">
      <span className="mx-auto shrink-0">
        <Logo height={24} />
      </span>

      <div className="flex flex-1 flex-col justify-center py-16">
        {step === 'terms' && (
          <TermsStep agreedIds={agreedTermIds} onChange={setAgreedTermIds} />
        )}

        {step === 'nickname' && (
          <NicknameStep
            nickname={nickname}
            status={nicknameStatus}
            // 입력이 바뀌면 중복확인을 다시 받아야 한다
            onNicknameChange={(value) => {
              setNickname(value);
              setNicknameStatus('idle');
            }}
            onStatusChange={setNicknameStatus}
          />
        )}

        {step === 'plan' && (
          <PlanStep selectedPlan={selectedPlan} onSelect={setSelectedPlan} />
        )}
      </div>

      {formError && (
        <p
          role="alert"
          className="text-body-sm text-red-ink read-col mb-4 shrink-0 font-medium"
        >
          {formError}
        </p>
      )}

      {/* 요금제 스텝의 확정 버튼도 여기 선다. 전에는 카드마다 '시작하기'가 하나씩
          있었는데, 카드가 Card(=button)로 바뀌면서 그 안에 버튼을 넣을 수 없게 됐다.
          세 스텝이 같은 자리에서 끝나는 쪽이 읽기도 쉽다. */}
      <div className="read-col flex shrink-0 items-center justify-between gap-4">
        <Button
          rank="secondary"
          // 제출 중에는 스텝을 벗어나지 못하게 막는다. 나간 뒤에 등록이 성공하면
          // router.push('/home')가 사용자가 직접 한 이동을 덮어쓴다.
          disabled={isSubmitting}
          onClick={handleBack}
        >
          이전
        </Button>

        {step === 'plan' ? (
          <Button disabled={isSubmitting} onClick={handleComplete}>
            {isSubmitting ? '등록 중…' : '시작하기'}
          </Button>
        ) : (
          <Button disabled={!canGoNext} onClick={handleNext}>
            다음
          </Button>
        )}
      </div>
    </div>
  );
}
