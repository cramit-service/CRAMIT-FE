'use client';
// src/shared/ui/FieldGroup.tsx
import { useId } from 'react';
import { FIELD_LABEL } from '@/shared/ui/fieldStyle';

interface FieldGroupProps {
  label: string;
  children: React.ReactNode;
}

// 라벨 하나가 칸 여럿을 덮는 자리 (마감 일시 = 날짜 + 시간, 강의 = 색 + 이름).
//
// <label htmlFor>로는 안 된다. htmlFor는 칸 하나만 가리키므로 나머지 칸은 이름을
// 못 받는다 — 실제로 "마감 일시"가 날짜 칸만 가리켜서, 시간 칸을 읽으면 무엇의
// 마감인지가 안 들렸다. role="group" + aria-labelledby면 안에 있는 칸 전부가
// 그 이름을 물려받는다.
//
// 칸 하나에 라벨 하나면 이게 아니라 그 부품의 label prop을 쓴다.
export function FieldGroup({ label, children }: FieldGroupProps) {
  const labelId = useId();

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
      <span id={labelId} className={FIELD_LABEL}>
        {label}
      </span>
      {children}
    </div>
  );
}
