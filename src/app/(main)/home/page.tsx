// src/app/(main)/home/page.tsx
import { StudyBanner } from '@/features/exam/components/StudyBanner';
import { ExamSchedule } from '@/features/exam/components/ExamSchedule';
import { Calendar } from '@/features/calendar/components/Calendar';
import { TodoChecklist } from '@/features/todo/components/TodoChecklist';

// 2×2 그리드: [배너 | 시험 일정] / [캘린더 | TODO]. 열 폭 839:655는 디자인 시안값.
// lg 이상에선 화면 높이에 고정한다(h-dvh + overflow-hidden). 1행은 auto, 2행은 minmax(0,1fr)로
// 남는 높이를 채워 섹션 높이가 항목 수와 무관해진다. 이 클램프 체인이 끊기면 페이지 전체가 밀린다.
// lg 미만에선 grid-cols-1로 쌓이고 페이지가 자연 스크롤된다.
export default function HomePage() {
  return (
    <div className="px-4 pt-10 pb-5 md:px-8 lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden lg:px-12">
      <div className="grid grid-cols-1 gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,839fr)_minmax(0,655fr)] lg:grid-rows-[auto_minmax(0,1fr)]">
        <StudyBanner />
        <ExamSchedule />
        <Calendar />
        <TodoChecklist />
      </div>
    </div>
  );
}
