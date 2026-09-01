'use client';
// src/features/auth/components/NicknameStep.tsx
import { useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { checkNickname } from '@/features/auth/api';

// 중복확인 결과 상태
export type NicknameStatus = 'idle' | 'available' | 'taken';

interface NicknameStepProps {
  nickname: string;
  status: NicknameStatus;
  onNicknameChange: (value: string) => void;
  onStatusChange: (status: NicknameStatus) => void;
}

// 어두운 입력 필드라 shared/ui/Input과 스타일이 다르고, 필드 안에 버튼이 들어간다.
// Input은 기본값에 border-gray-400이 박혀 있어 className으로 덮으면 cn()이 병합하지 못해
// 색이 충돌한다. 그래서 이 화면 전용으로 두되 상태별 분기 방식은 Input과 맞춘다.
const borderByStatus: Record<NicknameStatus, string> = {
  idle: 'border-gray-800',
  available: 'border-secondary-400',
  taken: 'border-error',
};

export function NicknameStep({
  nickname,
  status,
  onNicknameChange,
  onStatusChange,
}: NicknameStepProps) {
  // 응답을 기다리는 동안 연타로 중복 호출되지 않게 막는다 (state는 리렌더 전까지 갱신되지 않음)
  const isChecking = useRef(false);

  const canCheck = nickname.trim().length > 0;

  const handleCheck = async () => {
    if (!canCheck || isChecking.current) return;
    isChecking.current = true;

    try {
      const { available } = await checkNickname(nickname);
      onStatusChange(available ? 'available' : 'taken');
    } catch (error) {
      // TODO: 공통 에러 토스트가 생기면 그쪽으로 옮긴다
      console.error('닉네임 중복 확인 실패', error);
      onStatusChange('idle');
    } finally {
      isChecking.current = false;
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-3xl leading-snug font-bold text-gray-900 md:text-5xl">
        맞춤 학습 설정을 위한
        <br />
        마지막 단계예요.
      </h1>

      <div className="mt-24">
        <div className="flex items-end justify-between gap-4">
          <label
            htmlFor="nickname"
            className="text-sm font-medium text-gray-900"
          >
            닉네임*
          </label>

          {status === 'available' && (
            <p className="text-secondary-400 text-sm font-medium">
              사용 가능한 닉네임입니다.
            </p>
          )}
          {status === 'taken' && (
            <p role="alert" className="text-error text-sm font-medium">
              사용 중인 닉네임입니다.
            </p>
          )}
        </div>

        <div
          className={cn(
            'mt-2 flex items-center gap-3 rounded-md border bg-gray-800 px-5 py-3 transition-colors',
            borderByStatus[status],
          )}
        >
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            placeholder="닉네임을 작성해주세요."
            className="min-w-0 flex-1 bg-transparent py-1 text-gray-100 placeholder:text-gray-500 focus:outline-none"
          />

          {/*
            어두운 필드 위라 채운 하늘색 판 + 검정 글자는 바 위에 다른 바를 덧댄 것처럼 보인다.
            판을 없애고 글자·테두리만 밝게 둬서 필드 안의 액션으로 읽히게 한다.
            (호버에서만 채워 눌리는 대상임을 알린다.)
          */}
          <button
            type="button"
            onClick={handleCheck}
            disabled={!canCheck}
            className={cn(
              'shrink-0 rounded-md border px-4 py-1.5 text-sm font-medium transition-colors',
              canCheck
                ? 'border-secondary-400 text-secondary-400 hover:bg-secondary-400 hover:text-gray-950'
                : 'cursor-not-allowed border-gray-600 text-gray-600',
            )}
          >
            중복확인
          </button>
        </div>
      </div>
    </div>
  );
}
