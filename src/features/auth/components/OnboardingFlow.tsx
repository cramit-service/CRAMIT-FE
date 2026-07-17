'use client';
// src/features/auth/components/OnboardingFlow.tsx
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/shared/ui/Logo';
import { Button } from '@/shared/ui/Button';
import { TermsStep, REQUIRED_TERM_IDS } from './TermsStep';
import { NicknameStep, type NicknameStatus } from './NicknameStep';
import { PlanStep } from './PlanStep';
import { registerOnboardingProfile } from '../api';
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

  // 필수 약관이 모두 동의돼야 다음으로 넘어간다 (선택 약관은 영향 없음)
  const canGoNext =
    step === 'terms'
      ? REQUIRED_TERM_IDS.every((id) => agreedTermIds.includes(id))
      : nicknameStatus === 'available';

  const handleBack = () => {
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

  const handleComplete = async (plan: PlanId) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSelectedPlan(plan);

    try {
      await registerOnboardingProfile({ nickname, agreedTermIds, plan });

      // TODO: 홈 라우트가 생기면 router.push('/home')으로 교체한다.
      console.log('[mock] 온보딩 완료 — 홈으로 이동할 자리', {
        nickname,
        agreedTermIds,
        plan,
      });
    } catch (error) {
      // TODO: 공통 에러 토스트가 생기면 그쪽으로 옮긴다
      console.error('온보딩 프로필 등록 실패', error);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      <Logo className="mx-auto shrink-0 text-lg" />

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
          <PlanStep
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlan}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* 요금제 스텝은 카드의 '시작하기'가 완료를 맡으므로 '다음'을 두지 않는다 */}
      <div className="mx-auto flex w-full max-w-5xl shrink-0 items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          className="w-full max-w-xs"
          onClick={handleBack}
        >
          이전
        </Button>

        {step !== 'plan' && (
          <Button
            size="lg"
            className="w-full max-w-xs"
            disabled={!canGoNext}
            onClick={handleNext}
          >
            다음
          </Button>
        )}
      </div>
    </div>
  );
}
