'use client';
// src/features/auth/components/NicknameStep.tsx
import { useRef } from 'react';
import { checkNickname } from '@/features/auth/api';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

export type NicknameStatus = 'idle' | 'available' | 'taken';

interface NicknameStepProps {
  nickname: string;
  status: NicknameStatus;
  onNicknameChange: (value: string) => void;
  onStatusChange: (status: NicknameStatus) => void;
}

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
    <div className="read-col">
      <h1 className="text-heading-md font-semibold text-gray-800">
        맞춤 학습 설정을 위한
        <br />
        마지막 단계예요.
      </h1>

      {/* 설정의 프로필 수정과 같은 화면이다(닉네임 + 중복확인 + 3상태). 같은 모양으로 둔다.
          전에는 어두운 판(bg-gray-800) 안에 칸과 버튼이 함께 들어 있었다. §2에 어두운
          표면이 없고, §4는 필드의 채움을 필드 자체로 정해서 그 안에 채움을 하나 더 넣으면
          무엇이 칸인지 흐려진다.
          "Input은 기본값에 border-gray-400이 박혀 있어 덮을 수 없다"는 주석이 붙어 있었는데,
          그 사이 Input이 error prop과 FIELD_BOX를 갖게 돼서 이유가 사라졌다. */}
      <div className="mt-12 flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <Input
            id="nickname"
            label="닉네임"
            required
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            placeholder="닉네임을 입력해 주세요."
            error={status === 'taken' ? '사용 중인 닉네임이에요.' : undefined}
          />
        </div>
        <Button rank="secondary" onClick={handleCheck} disabled={!canCheck}>
          중복확인
        </Button>
      </div>

      {/* 쓸 수 있다는 말은 틀림이 아니라 상태다 — §2의 sky-ink가 "글자만으로 된 상태"다.
          틀림(사용 중)은 Input이 자기 error로 그린다. */}
      {status === 'available' && (
        <p role="status" className="text-body-sm text-sky-ink mt-2">
          사용 가능한 닉네임이에요.
        </p>
      )}
    </div>
  );
}
