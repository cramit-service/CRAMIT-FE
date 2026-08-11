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
// 2행 높이는 캘린더·TODO 카드가 정한다(auto). 두 카드는 하단이 맞아야 해서 높이가
// 같고(654), 2행 712는 거기에 제목 블록 34와 캘린더 쪽 범례 24를 더한 값이다.
// 예전에는 h-dvh + overflow-hidden으로 화면에 가둬 항목 수와 무관하게 만들었는데,
// 이제 카드 높이가 고정이라 그 클램프가 필요 없다.
// 더 낮은 화면에서는 잘리는 대신 자연 스크롤된다. lg 미만에선 grid-cols-1로 쌓인다.
//
// TODO(시안 대조): 1080 기준 세로 합이 68+150+52+712+44=1026이라 54px이 남는다.
// 1행이 #54 이전 값으로 되돌려지며 194→150으로 줄었는데 그만큼을 아래에서 받지 않아
// 생긴 여백이다. 어디로 보낼지는 시안을 봐야 정할 수 있다.
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
