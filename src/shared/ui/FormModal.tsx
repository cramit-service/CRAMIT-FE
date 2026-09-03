'use client';
// src/shared/ui/FormModal.tsx
import { useId } from 'react';
import { cn } from '@/shared/lib/cn';
import { Modal } from '@/shared/ui/Modal';

// 시안의 다크 입력 모달(시험 일정·TODO·강의 생성·공유·새 주차 업로드)이 공유하는 골격과 치수.
// 규격은 새 주차 업로드 모달(#49)에서 확정된 것을 그대로 따른다 — 여섯 개가 같은 시안 계열이라
// 값이 한 곳에 있어야 한쪽만 손봤을 때 서로 어긋나지 않는다.

// 입력 칸 공통. Figma 시안(높이 56·좌우 패딩 20)을 화면과 같은 0.72배로 줄였다.
// 타이포도 박스와 같은 0.72배(18 → 13). 가이드 4-4는 타이포를 줄이지 말라고 하지만,
// 그 규칙은 전체 화면 기준이라 0.72배로 줄인 모달 안에서는 글자만 남아 박스를 꽉 채운다.
export const FIELD_BASE =
  'h-10 rounded-md px-3.5 text-[13px] leading-5 font-medium tracking-[-0.26px] outline-none';
// 제목·메모처럼 채워진 입력. 값은 흰색, 안내 문구는 한 단계 흐리게 둬서 비어 있는 게 보이게 한다.
export const FIELD_FILLED = `${FIELD_BASE} bg-gray-800 text-gray-100 placeholder:text-gray-300 focus:ring-1 focus:ring-secondary-400`;
// 셀렉트·날짜처럼 테두리만 있는 입력. 폭은 호출처가 정한다.
export const FIELD_OUTLINED = `${FIELD_BASE} border-[0.5px] border-gray-500 bg-transparent text-gray-300 focus:border-secondary-400`;
// 강의·날짜 칸 폭. 시안은 186px(=134px)이지만 "2026-07-21"과 한글 과목명이 잘려서 조금 넓혔다.
export const FIELD_WIDTH = 'w-[156px]';

// 라벨도 같은 0.72배 (20 → 14).
export const LABEL =
  'text-[14px] leading-[22px] tracking-[-0.28px] text-gray-300';
// 보조 문구(상태 안내·에러)는 한 단계 더 작게.
export const HINT = 'text-[12px] leading-[18px] tracking-[-0.24px] break-keep';
export const SECTION_DIVIDER = 'border-b-[0.5px] border-gray-700';
// 필드 묶음 한 칸의 세로 여백. 시안에서 구분선 사이가 일정하다.
export const SECTION_GAP = 'py-8.5';

// 드롭다운으로 펼쳐지는 목록(강의·주차·시·분)의 한 판과 한 줄. 시안 1:14143.
// 띄우는 위치는 각 컴포넌트가 정한다 — 여기엔 판과 줄의 생김새만 둔다.
export const OPTION_LIST =
  'rounded-md border-[0.5px] border-gray-600 bg-gray-700 py-1 shadow-xl';
// 시안 40×좌우18 → 0.72배 29×13. 타이포도 같은 비율(16 → 12)이고,
// leading을 줄 높이와 같게 둬서 한 줄이 정확히 29px 상자 안에 가운데로 온다.
// (flex로 가운데 정렬하면 텍스트가 익명 플렉스 아이템이 돼 truncate의 말줄임이 먹지 않는다)
export const OPTION_ROW =
  'px-3.25 text-[12px] leading-7.25 font-medium tracking-[-0.24px]';

// 목록 항목의 상태별 색. 고른 항목이 호버보다 우선한다 —
// 호버는 잠깐이지만 무엇을 골랐는지는 계속 보여야 한다.
export function optionStateClass({
  selected,
  active,
}: {
  selected: boolean;
  /** 키보드 하이라이트 또는 마우스 오버 */
  active: boolean;
}) {
  if (selected) return 'bg-primary-400 text-gray-950';
  if (active) return 'bg-gray-100 text-gray-900';
  return 'text-gray-300';
}

// 하단 확정 버튼(생성하기·수정완료). 시안 346×60 → 0.72배 249×44.
// TODO: cn()이 클래스를 병합하게 됐으니 Button + className으로 대체할 수 있다.
export const PRIMARY_ACTION =
  'enabled:bg-secondary-400 enabled:hover:bg-secondary-500 flex h-11 w-[249px] items-center justify-center rounded-md text-[14px] leading-[22px] font-medium tracking-[-0.28px] transition-colors enabled:text-gray-950 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500';
// 삭제 버튼. 시안 192×60 → 0.72배 138×44. 위험 액션이라 error 토큰.
// 글자는 흰색 대신 gray-950 — error(#ff5d6b) 위에서 흰 글자는 대비가 2.7:1로 읽기 어렵다.
export const DANGER_ACTION =
  'enabled:bg-error mr-auto flex h-11 w-[138px] items-center justify-center rounded-md text-[14px] leading-[22px] font-medium tracking-[-0.28px] transition-colors enabled:text-gray-950 enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500';

interface IconProps {
  className?: string;
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

interface ModalSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** 기본은 좁은 칸(FIELD_WIDTH). 2열 그리드에서 칸을 꽉 채우려면 'w-full'을 넘긴다. */
  width?: string;
  children: React.ReactNode;
}

// 네이티브 셀렉트를 쓰되 기본 화살표를 지우고 시안 화살표를 얹는다.
// color-scheme:dark라야 OS가 그리는 목록도 어두운 배경으로 나온다.
export function ModalSelect({
  id,
  value,
  onChange,
  disabled,
  width = FIELD_WIDTH,
  children,
}: ModalSelectProps) {
  return (
    <div className={cn('relative', width)}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          FIELD_OUTLINED,
          'w-full appearance-none pr-9 scheme-dark',
        )}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 size-3 -translate-y-1/2 text-gray-500" />
    </div>
  );
}

interface FormModalProps {
  /** 모달 이름. 보조기술이 이 모달을 무엇이라 읽을지 결정한다. */
  title: string;
  /** 시안에 제목 글자가 실제로 그려진 모달만 true. 기본은 sr-only로 숨긴다. */
  titleVisible?: boolean;
  /** 제목 크기가 시안마다 달라 기본값과 다르게 그릴 때만 넘긴다.
   *  (강의 모달은 시안 32px = 0.72배 23px, 공유하기는 기본값 16px) */
  titleClassName?: string;
  /** 시안이 모달 높이를 고정한 화면만 넘긴다 (강의 모달 960 → 0.72배 691px).
   *  넘기면 내용이 짧아도 높이를 유지하고 확정 버튼이 아래에 붙는다.
   *  기본은 내용 높이만큼 — 다른 모달들은 시안 높이가 제각각이라 그대로 둔다. */
  fixedHeight?: string;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  /** 제출 중. 닫기·배경 클릭을 막아 진행 중인 요청이 버려지지 않게 한다. */
  busy?: boolean;
  /** 하단 버튼 줄. 우측 정렬이 기본이고, 삭제 버튼은 DANGER_ACTION의 mr-auto가 왼쪽으로 민다. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

// 다크 입력 모달의 껍데기 — 패널·닫기 버튼·스크롤 영역·하단 버튼 줄까지.
// 안쪽 필드 구성만 호출처가 채운다.
export function FormModal({
  title,
  titleVisible = false,
  titleClassName,
  fixedHeight,
  onClose,
  onSubmit,
  busy = false,
  footer,
  children,
}: FormModalProps) {
  const titleId = useId();

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  return (
    <Modal
      open
      onClose={handleClose}
      surface="bare"
      labelledBy={titleId}
      // Figma 960px 모달을 화면과 같은 0.72배(≈691px)로. 시안 높이가 노트북 화면을 넘기므로
      // 패널은 고정하고 안쪽만 스크롤시킨다.
      // relative는 닫기 버튼의 기준이자, 제목을 숨길 때 쓰는 sr-only(=position:absolute)의
      // 기준이기도 하다. 없으면 숨긴 제목이 문서 최상위 기준으로 떠 페이지 높이를 밀어낸다.
      className={cn(
        'relative flex max-h-[calc(100vh-64px)] w-172.75 max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border-[0.5px] border-gray-600 bg-gray-900',
        fixedHeight,
      )}
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label="닫기"
        disabled={busy}
        className="absolute top-5.75 right-5.75 z-10 text-gray-400 transition-colors hover:text-gray-100 disabled:cursor-not-allowed disabled:text-gray-700"
      >
        <CloseIcon className="size-5" />
      </button>

      {/* 스크롤바를 어두운 패널에 맞춘다. 기본 스크롤바는 밝은 회색이라
          모달 오른쪽에 흰 띠가 생겨 분위기가 끊긴다.
          scrollbar-color를 모르는 브라우저는 color-scheme:dark가 받아준다. */}
      <form
        // onSubmit을 안 넘긴 호출처에서 Enter를 치면 브라우저가 폼을 실제로 제출해
        // 페이지가 이동해 버린다. 기본값으로 그것만 막는다.
        onSubmit={onSubmit ?? ((e) => e.preventDefault())}
        className={cn(
          'scrollbar-dark flex min-h-0 flex-col overflow-y-auto px-15 pb-7 scheme-dark',
          // 높이를 고정한 모달에서만 폼이 남은 공간을 채워야 푸터가 바닥으로 간다.
          // 기본(내용 높이) 모달에 flex-1을 주면 min-h-0과 겹쳐 높이가 0으로 접힌다.
          fixedHeight && 'flex-1',
          // 제목이 보이는 모달은 제목이 위 여백을 일부 대신한다. 숨긴 모달은 첫 라벨까지의
          // 거리가 시안(≈65px)에 맞도록 여백을 더 준다.
          titleVisible ? 'pt-11' : 'pt-16',
        )}
      >
        {/* 시안 32px SemiBold. 모달 전체를 0.72배로 옮겼으므로 제목도 같이 줄이되,
            0.72배(23px)로는 여전히 박스 대비 글자가 커서 절반인 16px까지 내렸다. */}
        <h2
          id={titleId}
          className={
            titleVisible
              ? (titleClassName ??
                'mb-4.5 text-[16px] leading-6 font-semibold tracking-[-0.32px] text-gray-100')
              : 'sr-only'
          }
        >
          {title}
        </h2>

        {children}

        {footer && (
          <div
            className={cn(
              'flex items-center justify-end gap-3',
              // 바닥에 붙이면 위 여백은 margin이 아니라 padding으로 줘야 mt-auto와 안 겹친다.
              fixedHeight ? 'mt-auto pt-6' : 'mt-6',
            )}
          >
            {footer}
          </div>
        )}
      </form>
    </Modal>
  );
}
