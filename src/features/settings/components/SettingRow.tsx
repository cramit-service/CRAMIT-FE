'use client';
// src/features/settings/components/SettingRow.tsx
import { cn } from '@/shared/lib/cn';

// 프로필 화면의 어두운 행 한 줄. 알림·요금제·계정 설정이 모두 같은 상자를 쓴다.
// Figma: 747×76, radius 6, 좌우 패딩 20, 글자 20px.
// 이 화면은 홈처럼 글자를 시안 px 그대로 쓰므로 상자도 1:1로 둔다 (CLAUDE.md 4-4).
const ROW =
  'flex h-19 w-full items-center justify-between gap-4 rounded-md bg-gray-800 px-5';
// 색은 여기 넣지 않는다. cn()엔 tailwind-merge가 없어 text-gray-100 위에 text-error를
// 덧붙이면 둘 다 남고 승자가 클래스 생성 순서에 달린다(회원탈퇴가 흰 글자로 나왔다).
const ROW_TEXT = 'text-body-sm font-medium';
// 서로 겹치지 않는 '완성된' 색 세트를 통째로 고른다.
const ROW_TEXT_COLOR = { normal: 'text-gray-100', danger: 'text-error' };

interface SettingRowProps {
  /** 스크린리더가 옆의 컨트롤을 이 글자로 읽도록 id를 붙인다. */
  labelId?: string;
  label: string;
  /** 위험한 항목(회원탈퇴)은 글자를 error 색으로. */
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
      {children}
    </div>
  );
}

interface SettingLinkRowProps {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

// 행 전체가 버튼인 행 (로그아웃·회원탈퇴). 시안에서 우측 chevron이 "누르면 넘어간다"를 알린다.
export function SettingLinkRow({
  label,
  onClick,
  danger,
  disabled,
}: SettingLinkRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        ROW,
        'text-left transition-colors enabled:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60',
      )}
    >
      <span
        className={cn(ROW_TEXT, ROW_TEXT_COLOR[danger ? 'danger' : 'normal'])}
      >
        {label}
      </span>
      {/* 시안 비율 9×18 그대로 — 정사각 박스에 넣으면 좌우가 비어 위치가 어긋난다 */}
      <ChevronRightIcon
        className={cn(
          'h-[13px] w-[6.5px] shrink-0',
          danger ? 'text-error' : 'text-gray-400',
        )}
      />
    </button>
  );
}

// 시안 vector 9×18 — 얇은 라인 화살표
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 9 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M1 1l7 8-7 8" />
    </svg>
  );
}

// 섹션 제목 (알림 설정 / 요금제 / 계정 설정). Figma 24 → 0.72배.
export function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="text-[13px] leading-5 font-medium tracking-[-0.26px] text-gray-700">
        {title}
      </h2>
      {children}
    </section>
  );
}
