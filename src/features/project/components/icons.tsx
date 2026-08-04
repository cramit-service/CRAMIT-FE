// src/features/project/components/icons.tsx
// 새 주차 업로드 모달 전용 라인 아이콘. currentColor를 따르며 크기는 className으로 조절한다.

interface IconProps {
  className?: string;
}

// 업로드 클라우드. Figma 시안(26.4px 프레임, stroke 1.1)의 벡터를 그대로 옮겼다.
// viewBox를 원본 프레임 크기로 두어야 획 굵기 비율이 시안과 같다.
export function CloudUploadIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 26.4 26.4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-5'}
      aria-hidden
    >
      <path d="M7.70068 19.7984C6.32819 19.7984 5.01191 19.2768 4.04141 18.3485C3.07091 17.4202 2.52568 16.1612 2.52568 14.8484C2.52568 13.5355 3.07091 12.2765 4.04141 11.3482C5.01191 10.4199 6.32819 9.89836 7.70068 9.89836C8.02484 8.45426 8.97312 7.18519 10.3369 6.37035C11.0122 5.96687 11.7692 5.68706 12.5646 5.54688C13.3601 5.4067 14.1784 5.40891 14.9729 5.55336C15.7674 5.69781 16.5225 5.98169 17.1951 6.38879C17.8677 6.79588 18.4446 7.31822 18.8929 7.92598C19.3412 8.53374 19.6521 9.21502 19.8079 9.93092C19.9636 10.6468 19.9612 11.3833 19.8007 12.0984H20.9007C21.9218 12.0984 22.901 12.504 23.623 13.226C24.3451 13.948 24.7507 14.9273 24.7507 15.9484C24.7507 16.9694 24.3451 17.9487 23.623 18.6707C22.901 19.3927 21.9218 19.7984 20.9007 19.7984H19.8007" />
      <path d="M9.9002 16.4992L13.2002 13.1992L16.5002 16.4992" />
      <path d="M13.2002 13.1992V23.0992" />
    </svg>
  );
}

// 모달 닫기(×)
export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className={className ?? 'size-5'}
      aria-hidden
    >
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  );
}

// 셀렉트 오른쪽 화살표
export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 14.5 8.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-3'}
      aria-hidden
    >
      <path d="M0.75 0.75L7.25 7.75L13.75 0.75" />
    </svg>
  );
}
