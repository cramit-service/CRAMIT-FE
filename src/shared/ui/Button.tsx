'use client';
// src/shared/ui/Button.tsx
// Figma "Button" 시안 기준으로 재작성. 색·반경·타이포는 모두 @theme 토큰을 따른다.
// (Figma: rounded 6px = radius-md, 확정액션 secondary-400, 완료/성공 primary-400,
//  삭제 error, 비활성 gray-400. 타이포는 Pretendard, 자간 -2% = -0.02em.)
import { cn } from '@/shared/lib/cn';

// 이름은 색이 아니라 역할이다. 예전엔 primary가 하늘을, point가 연두를 칠해서
// 토큰 이름(primary-400 = 연두)과 정면으로 어긋났고, 규칙을 아는 사람일수록 반대로 집었다.
type Variant = 'confirm' | 'success' | 'danger' | 'outline' | 'dark';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// variant별 색상 스타일 (Figma 버튼 역할 매핑)
// - confirm : 하늘색, 일반 확정 액션 (다음/생성/업로드/확인) — 기본값
// - success : 연두, 시그니처 강조 (수정완료/전송 등 완료·성공)
// - danger  : 삭제/위험 액션
// - outline : 밝은 표면 위 보조 액션 (이전/취소/공유)
// - dark    : 어두운 강조 버튼 (크래밋 시작하기/회원가입/추가하기)
const variantStyles: Record<Variant, string> = {
  confirm: 'bg-secondary-400 text-gray-950 hover:bg-secondary-500',
  success: 'bg-primary-400 text-gray-950 hover:bg-primary-500',
  danger: 'bg-error text-gray-100 hover:brightness-95',
  outline: 'border border-gray-400 bg-gray-100 text-gray-900 hover:bg-gray-200',
  dark: 'bg-gray-900 text-gray-100 hover:bg-gray-800',
};

// size별 크기·타이포 (Figma Typography/Button 스케일)
// - lg : Large1  20 SemiBold / lh 28
// - md : Medium  18 Medium   / lh 30
// - sm : Small   16 Medium   / lh 28
// - xs : 목록 헤더의 작은 액션(홈 "추가하기") 12 Medium / h 28
const sizeStyles: Record<Size, string> = {
  // xs만 시안에 대응하는 타이포 변수가 없어 임의값을 남긴다.
  xs: 'h-7 px-3 text-[12px] leading-none font-medium tracking-[-0.24px]',
  sm: 'text-button-sm px-4 py-2 font-medium',
  md: 'text-body px-5 py-2.5 font-medium',
  lg: 'text-button-lg px-6 py-4 font-semibold',
};

export function Button({
  variant = 'confirm',
  size = 'md',
  // 기본은 'button'. HTML 기본값 'submit'이면 form 안에서 의도치 않게 제출되므로,
  // 제출 버튼만 호출처에서 type="submit"을 명시한다.
  type = 'button',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md whitespace-nowrap transition-colors',
        sizeStyles[size],
        // 비활성이면 회색 채움에 밝은 글자, 아니면 variant 색상 적용
        disabled
          ? 'cursor-not-allowed bg-gray-400 text-gray-100'
          : variantStyles[variant],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
