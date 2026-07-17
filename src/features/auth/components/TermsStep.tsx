'use client';
// src/features/auth/components/TermsStep.tsx
import { Checkbox } from '@/shared/ui/Checkbox';

export const TERMS = [
  { id: 'optional1', label: '(선택) 약관 1', required: false },
  { id: 'optional2', label: '(선택) 약관 2', required: false },
  { id: 'required1', label: '(필수) 약관 3', required: true },
] as const;

export const REQUIRED_TERM_IDS = TERMS.filter((t) => t.required).map(
  (t) => t.id,
);

interface TermsStepProps {
  agreedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TermsStep({ agreedIds, onChange }: TermsStepProps) {
  // 하위가 모두 체크되면 전체 동의도 체크된 것으로 본다
  const isAllAgreed = TERMS.every((t) => agreedIds.includes(t.id));

  const toggleAll = (checked: boolean) => {
    onChange(checked ? TERMS.map((t) => t.id) : []);
  };

  const toggleOne = (id: string, checked: boolean) => {
    onChange(checked ? [...agreedIds, id] : agreedIds.filter((v) => v !== id));
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="font-bold text-gray-900">서비스 약관에 동의해 주세요.</p>

      <div className="mt-8">
        <Checkbox
          checked={isAllAgreed}
          onChange={toggleAll}
          label={<span className="font-medium">전체 동의하기</span>}
        />

        <div className="mt-5 flex flex-col items-start gap-3 pl-6">
          {TERMS.map((term) => (
            <Checkbox
              key={term.id}
              checked={agreedIds.includes(term.id)}
              onChange={(checked) => toggleOne(term.id, checked)}
              label={<span className="text-sm">{term.label}</span>}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
