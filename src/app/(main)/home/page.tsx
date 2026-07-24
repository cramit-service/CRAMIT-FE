// src/app/(main)/home/page.tsx
import { StudyBanner } from '@/features/project/components/home/StudyBanner';
import { ExamSchedule } from '@/features/project/components/home/ExamSchedule';
import { Calendar } from '@/features/calendar/components/Calendar';
import { TodoChecklist } from '@/features/todo/components/TodoChecklist';

// 홈(대시보드) 페이지. page.tsx는 조립만 한다.
// 2×2 배치: 좌열=학습 배너+캘린더, 우열=시험 일정+TODO. 양쪽 열이 위에서부터 정렬된다.
// 열 폭 비율(839:655)은 디자인 시안 값. fr로 비율만 유지해 반응형으로 늘어난다.
// 좁은 화면(lg 미만)에선 grid-cols-1로 한 줄로 쌓인다.
export default function HomePage() {
  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,839fr)_minmax(0,655fr)]">
        <div className="flex flex-col gap-3">
          <StudyBanner />
          <Calendar />
        </div>
        <div className="flex flex-col gap-3">
          <ExamSchedule />
          <TodoChecklist />
        </div>
      </div>
    </div>
  );
}
