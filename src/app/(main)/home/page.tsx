// src/app/(main)/home/page.tsx
import { StudyBanner } from '@/features/project/components/home/StudyBanner';
import { ExamSchedule } from '@/features/project/components/home/ExamSchedule';
import { Calendar } from '@/features/calendar/components/Calendar';
import { TodoChecklist } from '@/features/todo/components/TodoChecklist';

// 홈(대시보드) 페이지. page.tsx는 조립만 한다.
// 진짜 2×2 그리드: [배너 | 시험 일정] / [캘린더 | TODO].
// 그리드 셀은 같은 행끼리 높이를 맞추므로(stretch), 배너가 시험 일정 높이에 맞춰 늘어나
// 위·아래가 정렬된다. 캘린더·TODO도 같은 행에서 정렬된다.
// 열 폭 비율(839:655)은 디자인 시안 값. fr로 비율만 유지해 반응형으로 늘어난다.
// 좁은 화면(lg 미만)에선 grid-cols-1로 한 줄로 쌓인다.
export default function HomePage() {
  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,839fr)_minmax(0,655fr)]">
        <StudyBanner />
        <ExamSchedule />
        <Calendar />
        <TodoChecklist />
      </div>
    </div>
  );
}
