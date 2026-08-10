// src/features/exam/components/fieldStyles.ts
// 시험일정 추가 모달의 입력 칸 공통 스타일.
// Figma 960px 모달을 화면과 같은 0.72배로 줄였다(칸 높이 56→40, 좌우 패딩 20→14).
// 타이포도 박스와 같은 0.72배를 적용한다(18→13). 가이드 4-4는 타이포를 줄이지 말라고 하지만,
// 그 규칙은 전체 화면 기준이라 0.72배로 줄인 모달 안에서는 글자만 남아 박스를 꽉 채운다.
//
// 값은 새 주차 업로드 모달(features/project)과 같지만 파일은 따로 둔다 — 담당 경계가 다르다.
// TODO: TODO 추가 모달에서도 같은 값이 필요해지면(세 번째 사용) shared로 올린다.

const FIELD_BASE =
  'h-10 rounded-md px-3.5 text-[13px] leading-5 font-medium tracking-[-0.26px] outline-none';

// 제목·메모처럼 채워진 입력. 값은 흰색, 안내 문구는 한 단계 흐리게 둬서 비어 있는 게 보이게 한다.
export const FIELD_FILLED = `${FIELD_BASE} bg-gray-800 text-gray-100 placeholder:text-gray-300 focus:ring-1 focus:ring-secondary-400`;

// 날짜처럼 테두리만 있는 입력. 폭은 호출처가 정한다
// (여기에 w-full을 넣으면 호출처의 고정 폭과 겹쳐 승자가 클래스 생성 순서에 달린다).
export const FIELD_OUTLINED = `${FIELD_BASE} border-[0.5px] border-gray-500 bg-transparent text-gray-300 focus:border-secondary-400`;

// 라벨도 같은 0.72배 (20 → 14).
export const LABEL =
  'text-[14px] leading-[22px] tracking-[-0.28px] text-gray-300';

// 보조 문구(상태 안내·에러)는 한 단계 더 작게.
export const HINT = 'text-[12px] leading-[18px] tracking-[-0.24px] break-keep';

export const SECTION_DIVIDER = 'border-b-[0.5px] border-gray-700';
