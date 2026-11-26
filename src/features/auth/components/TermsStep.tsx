'use client';
// src/features/auth/components/TermsStep.tsx
import { useState } from 'react';
import type { Term } from '@/shared/types/api';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { DocumentModal } from '@/shared/ui/DocumentModal';

interface TermsStepProps {
  /** 불러오기 전에는 undefined. */
  terms?: Term[];
  isError: boolean;
  onRetry: () => void;
  agreedIds: number[];
  onChange: (ids: number[]) => void;
}

export function TermsStep({
  terms,
  isError,
  onRetry,
  agreedIds,
  onChange,
}: TermsStepProps) {
  const [readingId, setReadingId] = useState<number | null>(null);

  const title = (
    <h1 className="text-heading-md font-semibold text-gray-800">
      서비스 약관에 동의해 주세요.
    </h1>
  );

  if (!terms) {
    return (
      <div className="read-col">
        {title}
        {isError ? (
          <div className="mt-8 flex flex-col items-start gap-4">
            <p role="alert" className="text-body-sm text-gray-700">
              약관을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </p>
            <Button rank="secondary" onClick={onRetry}>
              다시 시도
            </Button>
          </div>
        ) : (
          <p className="text-body-sm mt-8 text-gray-500">불러오는 중…</p>
        )}
      </div>
    );
  }

  // 하위가 모두 체크되면 전체 동의도 체크된 것으로 본다
  const isAllAgreed = terms.every((t) => agreedIds.includes(t.termId));

  const toggleAll = (checked: boolean) => {
    onChange(checked ? terms.map((t) => t.termId) : []);
  };

  const toggleOne = (id: number, checked: boolean) => {
    onChange(checked ? [...agreedIds, id] : agreedIds.filter((v) => v !== id));
  };

  const reading = terms.find((t) => t.termId === readingId);

  return (
    <div className="read-col">
      {title}

      <div className="mt-8">
        <Checkbox
          checked={isAllAgreed}
          onChange={toggleAll}
          label={
            <span className="text-body-sm font-medium">전체 동의하기</span>
          }
        />

        <div className="mt-5 flex flex-col gap-3 pl-6">
          {terms.map((term) => (
            <div
              key={term.termId}
              className="flex items-center justify-between gap-3"
            >
              <Checkbox
                checked={agreedIds.includes(term.termId)}
                onChange={(checked) => toggleOne(term.termId, checked)}
                label={
                  <span className="text-label">
                    ({term.required ? '필수' : '선택'}) {term.title}
                  </span>
                }
              />
              <Button
                rank="secondary"
                size="sm"
                aria-label={`${term.title} 보기`}
                onClick={() => setReadingId(term.termId)}
              >
                보기
              </Button>
            </div>
          ))}
        </div>
      </div>

      <DocumentModal
        open={!!reading}
        title={reading?.title ?? ''}
        action={
          // 이미 동의한 약관이면 닫기만 남긴다
          reading && !agreedIds.includes(reading.termId)
            ? {
                label: '동의하기',
                onClick: () => {
                  toggleOne(reading.termId, true);
                  setReadingId(null);
                },
              }
            : undefined
        }
        onClose={() => setReadingId(null)}
      >
        {reading?.content}
      </DocumentModal>
    </div>
  );
}
