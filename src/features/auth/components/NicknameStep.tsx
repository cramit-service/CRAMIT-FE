'use client';
// src/features/auth/components/NicknameStep.tsx
import { useEffect, useRef } from 'react';
import { checkNickname } from '@/features/auth/api';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

export type NicknameStatus = 'idle' | 'available' | 'taken' | 'failed';

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
  // 닉네임을 고치면 올라간다. 고치기 전에 보낸 확인의 응답이 새 닉네임에 붙지 않게 버린다.
  const requestId = useRef(0);

  // 단계를 오가면 ref가 새로 생긴다. 나갈 때 올려 두어야 남은 응답이 돌아와서 고친 닉네임에 붙지 않는다.
  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  const canCheck = nickname.trim().length > 0;

  const handleCheck = async () => {
    // 이미 통과한 닉네임은 다시 묻지 않는다. 버튼을 끄면 누른 자리의 키보드 포커스를 잃는다.
    if (!canCheck || status === 'available' || isChecking.current) return;
    isChecking.current = true;
    const id = ++requestId.current;
    onStatusChange('idle');

    try {
      const { available } = await checkNickname(nickname);
      if (id === requestId.current) {
        onStatusChange(available ? 'available' : 'taken');
      }
    } catch {
      if (id === requestId.current) onStatusChange('failed');
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
            // 서버 상한. 중복확인은 길이를 안 봐서 여기서 안 막으면 등록할 때야 실패한다.
            maxLength={255}
            value={nickname}
            onChange={(e) => {
              requestId.current += 1;
              onNicknameChange(e.target.value);
            }}
            placeholder="닉네임을 입력해 주세요."
            error={status === 'taken' ? '사용 중인 닉네임이에요.' : undefined}
            // undefined를 넘기면 Input이 error에 건 연결까지 덮어써서, 필요할 때만 넘긴다.
            {...(status === 'failed' && {
              'aria-describedby': 'nickname-check-failed',
            })}
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
      {/* 입력이 틀린 게 아니라 확인을 못 한 것이라 칸의 error가 아니라 따로 알린다. */}
      {status === 'failed' && (
        <p
          id="nickname-check-failed"
          role="alert"
          className="text-body-sm text-red-ink mt-2"
        >
          중복을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
