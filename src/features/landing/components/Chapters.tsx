// src/features/landing/components/Chapters.tsx
import { ChapterSection } from './ChapterSection';
import { UploadLead } from './pieces/upload';
import { SplitLead } from './pieces/read';
import { ReplayLead } from './pieces/replay';
import { AskLead } from './pieces/ask';
import { ExamLead } from './pieces/exam';

// 다섯 장. 순서와 제목은 "왜 만들었나"의 불편 다섯 줄과 짝이다.
// 장마다 큰 장면 하나 뒤에, 같이 되는 기능을 실제 화면으로 하나씩 본다.
export function Chapters() {
  return (
    <>
      <ChapterSection
        id="upload"
        label="1 · 올리기"
        title={['올리면, 끝.']}
        body="강의 자료와 녹음만 있으면 됩니다."
        lead={<UploadLead />}
        tour={[
          {
            title: '강의별로 차곡차곡',
            body: '주차는 강의 아래 쌓이고, 강의마다 색이 붙습니다.',
            shot: 'lectures',
          },
          {
            title: '긴 녹음도 그대로',
            body: '75분짜리 녹음도 200MB까지 한 번에 올립니다.',
            shot: 'upload',
          },
        ]}
      />
      <ChapterSection
        id="read"
        label="2 · 읽기"
        title={['슬라이드 옆에,', '요약.']}
        body="넘기는 대로 바로 읽습니다."
        lead={<SplitLead />}
        tour={[
          {
            title: '둘을 골라 나란히',
            body: '자료·요약·스크립트·TODO 중 두 개를 나란히 열고, 가운데를 끌어 폭을 맞춥니다.',
            shot: 'split',
          },
          {
            title: '집중 모드',
            body: '사이드바와 머리글을 접고, 자료만 화면 가득 남깁니다.',
            shot: 'focus',
          },
          {
            title: '학습포인트',
            body: '중요한 문장에 표시하면 옆 레일에 모이고, 누르면 그 자리로 갑니다.',
            shot: 'point',
          },
          {
            title: '요약 고치기',
            body: 'AI가 틀린 곳은 직접 고치고, 고친 대로 저장됩니다.',
            shot: 'edit',
          },
          {
            title: 'Markdown · PDF로',
            body: '시험 전엔 PDF로 뽑아 인쇄하고, 스터디원에겐 Markdown 그대로 보냅니다.',
            shot: 'export',
          },
        ]}
      />
      <ChapterSection
        id="replay"
        label="3 · 다시 듣기"
        title={['놓친 말은,', '그 페이지에서 다시.']}
        body="녹음이 페이지마다 나뉘어 있습니다."
        lead={<ReplayLead />}
        tour={[
          {
            title: '문장을 누르면 그 순간부터',
            body: '스크립트의 문장을 누르면 녹음이 그 시점부터 재생됩니다.',
            shot: 'seek',
          },
          {
            title: '자료를 넘기며 듣기',
            body: '강의 자료 위 재생 막대로, 슬라이드를 보면서 듣습니다.',
            shot: 'player',
          },
        ]}
      />
      <ChapterSection
        id="ask"
        label="4 · 묻기"
        title={['모르면,', '바로.']}
        body="이번 주 강의를 아는 AI에게 물어보세요."
        lead={<AskLead />}
        tour={[
          {
            title: '교수님 예시로 답합니다',
            body: '일반론 대신, 이번 주 강의에서 든 예시와 숫자로 설명합니다.',
            shot: 'answer',
          },
          {
            title: '대화가 이어집니다',
            body: '채팅을 닫았다 다시 열어도, 이 주차에서 물어본 것이 그대로 있습니다.',
            shot: 'session',
          },
        ]}
      />
      <ChapterSection
        id="exam"
        label="5 · 시험 준비"
        title={['D-5.', '오늘 할 일만.']}
        body="남은 날과 할 일을 한눈에."
        lead={<ExamLead />}
        tour={[
          {
            title: '달력 위의 할 일',
            body: '할 일이 강의 색으로 달력에 놓이고, 날짜를 누르면 그날 할 일만 봅니다.',
            shot: 'calendar',
          },
          {
            title: '공부하면서 할 일까지',
            body: '학습 화면 옆에 할 일을 열어 두고, 끝낸 것은 바로 체크합니다.',
            shot: 'todo',
          },
          {
            title: '몇 번 봤는지',
            body: '주차마다 회독 수를 세고, 1회독 이상인 주차로 진행률을 봅니다.',
            shot: 'review',
          },
        ]}
      />
    </>
  );
}
