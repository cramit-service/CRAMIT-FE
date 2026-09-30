'use client';
// src/features/settings/components/SettingRow.tsx
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';

// 설정 한 줄. 알림·요금제·계정 설정이 모두 같은 상자를 쓴다.
//
// 시안은 747×76의 어두운 판(bg-gray-800)이었다. §2에 어두운 표면이 없다 —
// canvas·surface·well 셋뿐이고, 새 주차 화면에서 같은 판정을 이미 했다.
// 게다가 그 판 위에서 회원탈퇴(text-error)와 플랜 변경 버튼(bg-secondary-400)은
// 토큰에 없는 이름이라 회색으로 상속돼 1.38:1로 판에 녹아 있었다.
//
// 상자는 Card와 같은 값이다 — 아래 SettingLinkRow가 실제로 Card를 쓰므로 둘이
// 어긋나면 한 섹션 안에서 행 모양이 갈린다. 그래서 여백도 Card와 같은 p-4이고,
// 높이는 양쪽 다 글자 24 + 32 + 테두리 2 = 58로 떨어진다.
const ROW =
  'bg-surface flex w-full items-center justify-between gap-4 rounded-md border border-gray-100 p-4';
const ROW_TEXT = 'text-body-sm font-medium';
// 색만 상태별로 갈린다 (회원탈퇴는 §2의 빨강 — 글자로 쓰는 쪽은 red-ink다).
const ROW_TEXT_COLOR = { normal: 'text-gray-800', danger: 'text-red-ink' };

interface SettingRowProps {
  /** 스크린리더가 옆의 컨트롤을 이 글자로 읽도록 id를 붙인다. */
  labelId?: string;
  label: string;
  /** 위험한 항목은 글자를 빨강으로. */
  danger?: boolean;
  /** 우측에 놓이는 컨트롤(스위치·버튼). */
  children?: React.ReactNode;
}

// 우측이 컨트롤인 행 — 행 자체는 누를 수 없다.
export function SettingRow({
  labelId,
  label,
  danger,
  children,
}: SettingRowProps) {
  return (
    <div className={ROW}>
      <span
        id={labelId}
        className={cn(ROW_TEXT, ROW_TEXT_COLOR[danger ? 'danger' : 'normal'])}
      >
        {label}
      </span>
      {/* -my-2 — 컨트롤이 40(§2 컨트롤 md)이라 그대로 두면 24짜리 글자 줄을 밀어
          이 행만 혼자 높아진다. 줄 높이는 글자가 정하고 컨트롤은 그 위에 얹힌다
          (TODO 행의 연필과 같은 규칙). */}
      <span className="-my-2 flex shrink-0 items-center">{children}</span>
    </div>
  );
}

interface SettingLinkRowProps {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

// 행 전체가 버튼인 행 (로그아웃·회원탈퇴). 우측 chevron이 "누르면 넘어간다"를 알린다.
// 날것 button이었다. Card가 press를 받으면 스스로 button으로 그리고 §2의 누름 규칙
// (호버 8%·눌림 16%)까지 들고 있어서, 여기서 다시 쓸 것이 없다.
// navigates — 둘 다 이 화면을 떠난다(로그아웃은 랜딩으로, 탈퇴는 확인 모달로).
// 떠나는 눌림은 그려지자마자 페이지와 함께 버려지므로 active를 그리지 않는다.
export function SettingLinkRow({
  label,
  onClick,
  danger,
  disabled,
}: SettingLinkRowProps) {
  return (
    <Card press="navigates" onClick={onClick} disabled={disabled}>
      <span className="flex min-h-6 w-full items-center justify-between gap-4">
        <span
          className={cn(ROW_TEXT, ROW_TEXT_COLOR[danger ? 'danger' : 'normal'])}
        >
          {label}
        </span>
        <span
          className={cn(
            'flex shrink-0',
            danger ? 'text-red-ink' : 'text-gray-400',
          )}
        >
          <Icon name="arrow-right" size={16} />
        </span>
      </span>
    </Card>
  );
}

// 섹션 제목 (알림 설정 / 요금제 / 계정 설정).
// §3은 20을 "A card, a panel, a section"에 준다 — 홈의 카드 제목과 같은 칸이다.
// 18이었는데 그건 §3에서 제목이 아니라 본문 크기다.
export function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-body-md font-semibold text-gray-800">{title}</h2>
      {children}
    </section>
  );
}
