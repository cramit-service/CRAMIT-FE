import { Card } from '@/shared/ui/Card';

// TODO 체크리스트 위젯 자리표시자.
// 높이: Figma 412 × 0.72(팀 스케일) ≈ 296.
// 체크 항목 리스트·추가하기 버튼은 다음 작업에서 구현한다.
export function TodoChecklist() {
  return (
    <Card className="flex min-h-74 items-center justify-center text-[13px] text-gray-500">
      TODO 체크리스트 자리
    </Card>
  );
}
