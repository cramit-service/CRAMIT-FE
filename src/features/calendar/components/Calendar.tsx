import { Card } from '@/shared/ui/Card';

// 캘린더 위젯 자리표시자.
// 높이: Figma 652 × 0.72(팀 스케일) ≈ 470.
// 월 그리드(MON~SUN)·월 이동·일정 라벨은 다음 작업에서 구현한다.
export function Calendar() {
  return (
    <Card className="flex min-h-117.5 items-center justify-center text-[13px] text-gray-500">
      캘린더 자리
    </Card>
  );
}
