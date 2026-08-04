// src/app/(main)/home/page.tsx
import { StudyBanner } from '@/features/exam/components/StudyBanner';
import { ExamSchedule } from '@/features/exam/components/ExamSchedule';
import { Calendar } from '@/features/calendar/components/Calendar';
import { TodoChecklist } from '@/features/todo/components/TodoChecklist';

// 2×2 그리드: [배너 | 시험 일정] / [캘린더 | TODO]. 열 폭 839:655는 디자인 시안값.
// lg 이상에선 화면 높이에 고정한다(h-dvh + overflow-hidden). 1행은 auto, 2행은 minmax(0,1fr)로
// 남는 높이를 채워 섹션 높이가 항목 수와 무관해진다. 이 클램프 체인이 끊기면 페이지 전체가 밀린다.
// lg 미만에선 grid-cols-1로 쌓이고 페이지가 자연 스크롤된다.
//
// 폭은 lg 이상에서 1088px로 고정하고 가운데 정렬한다. flex-1인 main에 맡기면 사이드바를
// 접었다 펼 때마다 배너·캘린더·TODO가 같이 늘었다 줄어든다.
// 1088 = 시안 콘텐츠 폭 1511 × 0.72이고, 1440 화면 + 사이드바 펼침 상태의 기존 렌더 폭과 같다.
// max-w-full은 1088이 안 들어가는 좁은 화면(lg~) 때문이다. 없으면 부모의 overflow-hidden에
// 잘려 TODO 섹션이 화면 밖으로 사라진다.
export default function HomePage() {
  return (
    <div className="px-4 pt-10 pb-5 md:px-8 lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden lg:px-12">
      <div className="grid grid-cols-1 gap-6 lg:mx-auto lg:min-h-0 lg:w-272 lg:max-w-full lg:flex-1 lg:grid-cols-[minmax(0,839fr)_minmax(0,655fr)] lg:grid-rows-[auto_minmax(0,1fr)]">
        <StudyBanner />
        <ExamSchedule />
        <Calendar />
        <TodoChecklist />
      </div>
    </div>
  );
}
