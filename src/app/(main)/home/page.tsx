// src/app/(main)/home/page.tsx
import { StudyBanner } from '@/features/exam/components/StudyBanner';
import { ExamSchedule } from '@/features/exam/components/ExamSchedule';
import { Calendar } from '@/features/calendar/components/Calendar';
import { TodoChecklist } from '@/features/todo/components/TodoChecklist';

// 홈(대시보드) 페이지. page.tsx는 조립만 한다.
// 2×2 그리드: [배너 | 시험 일정] / [캘린더 | TODO].
// lg 이상에선 화면 높이(100dvh)에 고정하고 페이지 스크롤을 막는다(overflow-hidden).
// 1행(배너/시험)은 고정 높이, 2행(캘린더/TODO)은 grid-rows의 1fr로 "남는 높이"를 채운다.
// → 섹션 높이가 요소 갯수가 아니라 화면 높이로 정해지고, 넘치는 목록은 각자 내부 스크롤한다.
// 열 폭 비율(839:655)은 디자인 시안 값. 좁은 화면(lg 미만)에선 grid-cols-1로 쌓이고 자연 스크롤된다.
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
