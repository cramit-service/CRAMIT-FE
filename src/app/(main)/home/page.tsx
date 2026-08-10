// src/app/(main)/home/page.tsx
import { StudyBanner } from '@/features/exam/components/StudyBanner';
import { ExamSchedule } from '@/features/exam/components/ExamSchedule';
import { Calendar } from '@/features/calendar/components/Calendar';
import { TodoChecklist } from '@/features/todo/components/TodoChecklist';

// 2×2 그리드: [배너 | 시험 일정] / [캘린더 | TODO]. 열 폭 839:655와 간격 17/52는 시안값이다.
// lg 이상에선 화면 높이에 고정한다(h-dvh + overflow-hidden). 1행은 auto, 2행은 minmax(0,1fr)로
// 남는 높이를 채워 섹션 높이가 항목 수와 무관해진다. 이 클램프 체인이 끊기면 페이지 전체가 밀린다.
// lg 미만에선 grid-cols-1로 쌓이고 페이지가 자연 스크롤된다.
//
// 폭은 시안 콘텐츠 폭 1512px을 상한으로 두고 가운데 정렬한다. 이 화면은 글자를 시안 px
// 그대로 쓰므로(CLAUDE.md 4-4) 콘텐츠 폭까지 0.72로 줄이면 글자만 상대적으로 1.4배가 되어
// 칸이 빼곡해진다 — 그래서 여기선 폭도 박스 값도 시안 1:1로 간다.
// 1920 + 사이드바 펼침이면 1512가 그대로 들어가고, 1440에선 1088(기존 폭)로 줄어든다.
// 상한에 걸리는 넓은 화면에선 사이드바를 접었다 펴도 폭이 안 흔들린다. 1512가 안 들어가는
// 화면에선 흔들리는데, 그건 이 화면에서 감수하기로 한 트레이드오프다.
export default function HomePage() {
  return (
    <div className="px-4 pt-10 pb-5 md:px-8 lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden lg:px-12">
      <div className="grid grid-cols-1 gap-6 lg:mx-auto lg:min-h-0 lg:w-full lg:max-w-[1512px] lg:flex-1 lg:grid-cols-[minmax(0,839fr)_minmax(0,655fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-[17px] lg:gap-y-13">
        <StudyBanner />
        <ExamSchedule />
        <Calendar />
        <TodoChecklist />
      </div>
    </div>
  );
}
