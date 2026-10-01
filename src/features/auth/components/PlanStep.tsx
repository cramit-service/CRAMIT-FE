'use client';
// src/features/auth/components/PlanStep.tsx
import type { PlanId } from '@/shared/types/api';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';

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

interface PlanStepProps {
  selectedPlan: PlanId;
  onSelect: (plan: PlanId) => void;
}

export function PlanStep({ selectedPlan, onSelect }: PlanStepProps) {
  return (
    <div className="read-col">
      <h1 className="text-heading-md text-center font-semibold text-gray-800">
        나에게 맞는 플랜을 선택해 보세요.
      </h1>

      {/* 카드마다 '시작하기'가 하나씩 있었다. 카드를 Card로 옮기면 카드 자체가 button이
          되므로 그 안에 버튼을 또 넣을 수 없다(중첩 인터랙티브). 완료는 흐름 푸터의
          '시작하기' 하나가 맡고, 여기서는 고르기만 한다 — 다른 두 스텝과 같은 모양이다.

          선택 표시는 Card의 selected다. 전에는 border-secondary-400과 bg-secondary-400이
          둘 다 토큰에 없어서, 카드를 골라도 아무 표시가 나지 않았다.
          role="radio"를 직접 붙이고 Enter·Space를 손으로 받던 것도 없어진다 —
          Card가 button으로 그리므로 키보드가 저절로 따라온다. 라디오 그룹의
          좌우 화살표 이동까지는 아니지만, 세 장이 탭으로 지나가는 목록이면 충분하다. */}
      <ul
        role="radiogroup"
        aria-label="요금제"
        className="mt-20 grid gap-6 md:grid-cols-3"
      >
        {PLANS.map((plan) => {
          const isSelected = plan.id === selectedPlan;

          return (
            <li key={plan.id} className="flex">
              <Card
                press="in-place"
                selected={isSelected}
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelect(plan.id)}
              >
                <span className="flex h-full flex-col">
                  <span className="text-body-md font-semibold text-gray-800">
                    {plan.name}
                  </span>

                  <span className="mt-4 block">
                    <span className="text-heading-sm font-semibold text-gray-800">
                      {plan.price}
                    </span>
                    <span className="text-label ml-1 text-gray-500">/월</span>
                  </span>

                  <span className="text-body-sm mt-8 block text-gray-700">
                    {plan.description}
                  </span>

                  <span className="mt-6 flex flex-col gap-2">
                    {plan.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-body-sm flex items-center gap-2 text-gray-700"
                      >
                        <span className="flex shrink-0 text-gray-400">
                          <Icon name="check" size={16} />
                        </span>
                        {feature}
                      </span>
                    ))}
                  </span>
                </span>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
