// src/features/study/components/viewer/panel.ts

// 학습 뷰어 탭 4종(PDF·요약·원문 스크립트·TODO)이 공유하는 패널 크기·배경.
// 탭을 바꿔도 화면이 출렁이지 않아야 하므로 높이를 한곳에서만 정한다.
// 높이는 화면이 준 남은 공간을 그대로 채운다. 590px은 더 이상 목표치가 아니라 하한이다
// — 창이 짧아도 이 아래로는 안 줄어든다(그 밑으로 가면 어느 탭이든 내용이 안 보인다).
// 패널은 페이지 위에 올라선 읽는 판이라 surface다 (§2가 "카드·패널·모달·메뉴"로 이름을 댄다).
// 그림자는 안 쓴다 — §2가 떠 있는 것에만 허락하고, 이 판은 떠 있지 않다.
export const VIEWER_PANEL = 'bg-surface h-full min-h-[590px] rounded-lg';
