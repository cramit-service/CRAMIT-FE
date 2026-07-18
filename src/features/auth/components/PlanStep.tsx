'use client';
// src/features/auth/components/PlanStep.tsx
import { cn } from '@/shared/lib/cn';
import type { PlanId } from '@/shared/types/api';

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  description: string;
  features: string[];
}

// 가격은 와이어프레임 그대로 placeholder를 유지한다 (결제는 이번 범위 아님)
const PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: '무료',
    description: '시작을 위한 플랜',
    features: ['내용1', '내용2'],
  },
  {
    id: 'STANDARD',
    name: 'Standard',
    price: '00,000₩',
    description: '꾸준한 성장을 위한 플랜',
    features: ['내용1', '내용2'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '00,000₩',
    description: '가장 깊이 있는 분석 경험',
    features: ['내용1', '내용2'],
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="m4 11 6 6L21 5" />
    </svg>
  );
}

interface PlanStepProps {
  selectedPlan: PlanId;
  onSelect: (plan: PlanId) => void;
  onComplete: (plan: PlanId) => void;
  isSubmitting: boolean;
}

export function PlanStep({
  selectedPlan,
  onSelect,
  onComplete,
  isSubmitting,
}: PlanStepProps) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-center text-2xl font-bold text-gray-900 md:text-4xl">
        나에게 맞는 플랜을 선택해 보세요.
      </h1>

      <ul className="mt-20 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isSelected = plan.id === selectedPlan;

          return (
            <li key={plan.id}>
              {/*
                shared/ui/Card는 기본값에 border-gray-300이 박혀 있어 className으로 선택 색을 덮으면
                cn()이 병합하지 못해 두 border 클래스가 충돌한다. 그래서 여기서는 직접 분기한다.
              */}
              <div
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onSelect(plan.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(plan.id);
                  }
                }}
                className={cn(
                  'flex h-full cursor-pointer flex-col rounded-lg border bg-gray-100 p-6 transition-colors',
                  isSelected ? 'border-secondary-400' : 'border-gray-300',
                )}
              >
                <p className="text-secondary-400 text-xl font-bold">
                  {plan.name}
                </p>

                <p className="mt-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-sm text-gray-600">/월</span>
                </p>

                <p className="mt-8 text-sm text-gray-700">{plan.description}</p>

                <ul className="mt-6 flex flex-col gap-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-gray-800"
                    >
                      <CheckIcon className="h-4 w-4 shrink-0 text-gray-700" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation(); // 카드 선택과 중복 처리되지 않게 한다
                    onComplete(plan.id);
                  }}
                  className={cn(
                    'mt-10 w-full rounded-md py-3 text-sm font-medium transition-colors',
                    // 비활성이면 회색만, 아니면 선택 여부에 따라 채움/외곽선
                    isSubmitting
                      ? 'cursor-not-allowed bg-gray-400 text-gray-600'
                      : isSelected
                        ? 'bg-secondary-400 hover:bg-secondary-500 text-gray-900'
                        : 'border border-gray-400 bg-gray-100 text-gray-900 hover:bg-gray-200',
                  )}
                >
                  시작하기
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
