// src/app/(main)/home/page.tsx
import { StudyBanner } from '@/features/exam/components/StudyBanner';
import { ExamSchedule } from '@/features/exam/components/ExamSchedule';
import { Calendar } from '@/features/calendar/components/Calendar';
import { TodoChecklist } from '@/features/todo/components/TodoChecklist';

// 2×2 그리드: [배너 | 시험 일정] / [캘린더 | TODO].
// 시안(Figma 24:9523, 1920×1080)의 절대 좌표를 그대로 옮긴다:
//   콘텐츠 249..1760 (폭 1511) · 좌열 839 · 우열 655 · 열 간격 17 · 행 간격 52
//   배너 상단 68 · 프레임 하단 여백 44
// 1512 상한 + mx-auto면 사이드바 접힘(90) 기준 1830 영역에서 좌우 여백이 159/159로
// 시안(159/160)과 맞는다. 이 화면은 글자를 시안 px 그대로 쓰므로(CLAUDE.md 4-4)
// 폭도 박스 값도 시안 1:1로 간다.
//
// 2행 높이는 캘린더·TODO 카드가 각자 시안 높이로 고정돼 내용이 정한다(auto).
// 예전에는 h-dvh + overflow-hidden으로 화면에 가둬 항목 수와 무관하게 만들었는데,
// 이제 카드 높이가 고정이라 그 클램프가 필요 없다. 1080에서는 68+198+52+717+44=1079로
// 딱 들어가고, 더 낮은 화면에서는 잘리는 대신 자연 스크롤된다.
// lg 미만에선 grid-cols-1로 쌓인다.
export default function HomePage() {
  return (
    <div className="px-4 pt-10 pb-5 md:px-8 lg:min-h-dvh lg:px-12 lg:pt-[68px] lg:pb-11">
      <div className="grid grid-cols-1 gap-6 lg:mx-auto lg:w-full lg:max-w-[1512px] lg:grid-cols-[minmax(0,839fr)_minmax(0,655fr)] lg:grid-rows-[auto_auto] lg:gap-x-[17px] lg:gap-y-13">
        <StudyBanner />
        <ExamSchedule />
        <Calendar />
        <TodoChecklist />
      </div>
    </div>
  );
}
