import { Card } from '@/shared/ui/Card';

// 학습 배너 자리표시자. (좌상단, 캘린더와 같은 폭)
// 높이: Figma 198 × 0.72(팀 스케일) ≈ 142.
// 추천/이어서 학습할 강의명 + D-DAY + 학습 진행률 + "학습하러 가기" CTA + 마스코트
// 일러스트는 다음 작업에서 구현한다.
export function StudyBanner() {
  return (
    <Card className="flex min-h-35.5 items-center justify-center text-[13px] text-gray-500">
      학습 배너 자리
    </Card>
  );
}
