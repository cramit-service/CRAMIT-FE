// src/features/study/components/viewer/panel.ts

// 학습 뷰어 탭 4종(PDF·요약·원문 스크립트·TODO)이 공유하는 패널 크기·배경.
// 탭을 바꿔도 화면이 출렁이지 않아야 하므로 높이를 한곳에서만 정한다.
// 높이는 화면이 준 남은 공간을 그대로 채운다. 590px은 더 이상 목표치가 아니라 하한이다
// — 창이 짧아도 이 아래로는 안 줄어든다(그 밑으로 가면 어느 탭이든 내용이 안 보인다).
export const VIEWER_PANEL = 'h-full min-h-[590px] rounded-md bg-gray-900';
