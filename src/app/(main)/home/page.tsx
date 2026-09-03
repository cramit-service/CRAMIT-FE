// src/app/(main)/home/page.tsx
import { StudyBanner } from '@/features/exam/components/StudyBanner';
import { ExamSchedule } from '@/features/exam/components/ExamSchedule';
import { Calendar } from '@/features/calendar/components/Calendar';
import { TodoChecklist } from '@/features/todo/components/TodoChecklist';
import { TodoFilterProvider } from '@/features/todo/hooks/useTodoFilter';

// 2×2 그리드: [배너 | 시험 일정] / [캘린더 | TODO].
// 시안(Figma 24:9523, 1920×1080)의 절대 좌표를 그대로 옮긴다:
//   콘텐츠 249..1760 (폭 1511) · 좌열 839 · 우열 655 · 열 간격 17 · 행 간격 52
//   배너 상단 68 · 프레임 하단 여백 44
// 1512 상한 + mx-auto면 사이드바 접힘(90) 기준 1830 영역에서 좌우 여백이 159/159로
// 시안(159/160)과 맞는다. 이 화면은 글자를 시안 px 그대로 쓰므로(CLAUDE.md 4-4)
// 폭도 박스 값도 시안 1:1로 간다.
//
// 2행 높이는 캘린더·TODO 카드가 정한다(auto). 두 카드는 하단이 맞아야 해서 높이가
// 같고(654), 2행 716은 거기에 제목 블록 34와 카드 아래 한 줄 28을 더한 값이다.
// 카드 아래 줄은 캘린더가 범례(mt-2 + 16 = 24), TODO가 길게 누르기 안내(mt-2 + 20 = 28)라
// 높은 쪽이 행 높이를 정한다.
// 예전에는 h-dvh + overflow-hidden으로 화면에 가둬 항목 수와 무관하게 만들었는데,
// 이제 카드 높이가 고정이라 그 클램프가 필요 없다.
// 더 낮은 화면에서는 잘리는 대신 자연 스크롤된다. lg 미만에선 grid-cols-1로 쌓인다.
//
// 1행 163 = 제목 블록 34 + 시험 카드 129. 카드 높이를 바꾸면 여기 숫자도 같이 바꾼다.
//
// TODO(시안 대조): 1080 기준 세로 합이 68+163+52+716+44=1043이라 37px이 남는다.
// 1행이 #54 이전 값으로 되돌려지며 194→163으로 줄었는데 그만큼을 아래에서 받지 않아
// 생긴 여백이다. 어디로 보낼지는 시안을 봐야 정할 수 있다.
export default function HomePage() {
  return (
    <div className="px-4 pt-10 pb-5 md:px-8 lg:min-h-dvh lg:px-0 lg:pt-[68px] lg:pb-11">
      {/* 캘린더에서 고른 날짜를 TODO 체크리스트가 알아야 한다. 둘은 격자에서 형제라
          서로를 모르므로 공통 조상인 여기서 Context로 묶는다. page는 조립만 하고
          상태는 훅이 들고 있어 'use client'가 필요 없다. */}
      <TodoFilterProvider>
        <div className="grid grid-cols-1 gap-6 lg:mx-auto lg:w-[82.57%] lg:max-w-[1511px] lg:grid-cols-[minmax(0,839fr)_minmax(0,655fr)] lg:grid-rows-[auto_auto] lg:gap-x-[17px] lg:gap-y-13">
          <StudyBanner />
          <ExamSchedule />
          <Calendar />
          <TodoChecklist />
        </div>
      </TodoFilterProvider>
    </div>
  );
}
