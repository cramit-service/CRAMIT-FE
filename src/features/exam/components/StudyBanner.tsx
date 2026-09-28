'use client';
// src/features/exam/components/StudyBanner.tsx
import Image from 'next/image';
import Link from 'next/link';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { cn } from '@/shared/lib/cn';
import { daysUntil } from '@/features/exam/lib/dday';
import { DdayBadge } from '@/features/exam/components/DdayBadge';
import { examName } from '@/features/exam/lib/examName';
import { useExams } from '@/features/exam/hooks/useExams';
import { LearningProgress } from '@/features/study/components/LearningProgress';
import { Icon } from '@/shared/ui/Icon';

// 두 상태가 같은 껍데기를 쓴다. 표면·모서리·테두리는 홈의 다른 카드와 같은 값이고,
// 그 위에 GradientBackground가 옅은 쓸기를 얹는다. 예전에는 채워진 쪽이 그라디언트,
// 빈 쪽이 어두운 판(bg-gray-800)이라 한 자리가 표면 둘을 가졌다.
//
// 170이 1행의 높이다 — 배너가 그 숫자를 갖고, 옆 시험 일정 카드가 여기서 제목 블록 46을
// 빼 자기 높이를 정한다(그래야 둘의 하단이 맞는다). 내용은 162뿐이라 8이 남고,
// 아래 justify-center가 그 8을 위아래로 가른다. 내용에 딱 맞추지 않는 이유는
// 시험 목록이 그만큼 짧아지기 때문이다 — 지금 2행 + 다음 행이 걸치는 자리다.
const SHELL =
  'bg-surface relative flex min-h-42.5 flex-col overflow-hidden rounded-md border border-gray-100';

// 장식 — 캐릭터(고양이)와 낙서. 순수 장식이라 aria-hidden.
// SVG라 next/image 최적화 경로(400)를 피하려 unoptimized로 그대로 서빙한다.
// 홈 첫 화면 상단이라 고양이가 LCP로 잡힌다. preload로 미리 받아 Next의 LCP 경고를
// 없애고 배너가 늦게 채워지는 것도 막는다(Next 16부터 같은 일을 하던 priority는 deprecated).
function BannerDecor({ doodleAt }: { doodleAt: string }) {
  return (
    <>
      <Image
        src="/images/Banner_extra.svg"
        alt=""
        aria-hidden
        width={72}
        height={83}
        unoptimized
        className={cn(
          'pointer-events-none absolute top-10 h-14 w-auto select-none',
          doodleAt,
        )}
      />
      <Image
        src="/images/Crait_Cat.svg"
        alt=""
        aria-hidden
        width={195}
        height={154}
        unoptimized
        preload
        className="pointer-events-none absolute right-3 bottom-3 h-26 w-auto select-none"
      />
    </>
  );
}

// 학습 배너. 가장 임박한 시험(exams[0])의 강의를 "이어서 학습" 대상으로 보여준다.
// 데이터는 시험 일정과 함께 내려온다(useExams 재사용).
export function StudyBanner() {
  const { data: exams, isLoading, isError } = useExams();
  // getExams가 임박한 순으로 정렬해 주므로 첫 번째가 배너 대상.
  const featured = exams?.[0];
  // 로딩·실패 중에는 featured가 없다. 아래 뱃지는 featured가 있을 때만 그린다.
  const days = featured ? daysUntil(featured.examDate) : 0;
  // 백엔드가 붙기 전이라 progress가 빠져 올 수 있다 — 없으면 진행 바를 통째로 접는다.
  const rawProgress = featured?.progress;
  const progress: number | null = Number.isFinite(rawProgress)
    ? (rawProgress as number)
    : null;

  // 조회가 끝났고 정말로 일정이 없을 때만 빈 배너를 보여준다.
  // 로딩 중이나 실패했을 때 띄우면 "일정이 없다"고 단정하는 셈이 된다.
  if (!isLoading && !isError && !featured) {
    return <EmptyExamBanner />;
  }

  return (
    <div
      className={cn(
        SHELL,
        // justify-center — 1행 높이는 옆의 시험 일정 카드가 정하고(202), 배너 내용은
        // 166밖에 안 된다. 위로 붙이면 남는 36이 전부 아래로 가서 제목이 배너 가운데보다
        // 24 위에 앉는다. py-5는 이제 실제 간격이 아니라 하한이다 — lg 미만에서 배너가
        // 자기 내용 높이로 줄면 그때 다시 일을 한다.
        'has-[a:focus-visible]:ring-sky-ink justify-center py-5 pr-12 pl-6 transition-[filter] duration-150 ease-out has-[a:focus-visible]:ring-2',
        // 호버는 featured가 있을 때만 — 로딩·에러 때는 안쪽 Link가 없어서 눌리지 않는데
        // 반응만 하면 눌리는 것처럼 보인다.
        // 그림자였다(hover:shadow-md). §2는 그림자를 «떠 있는 것»에만 주고 두 단 다
        // 페이지 위(모달)나 그 위(드롭다운)를 뜻한다 — 페이지 위 카드는 뜨지 않는다.
        // Card의 pressable과 같은 말을 쓴다 — §4의 8%를 채움에 곱한 값이 92다.
        featured && 'hover:brightness-92',
      )}
    >
      <GradientBackground layer variant="banner" />
      <BannerDecor doodleAt="left-[67%]" />
      {featured && (
        // 배너 전체가 학습 진입 링크다. Link에는 위치를 주지 않는다 — 주는 순간 after의
        // 기준이 배너가 아니라 링크 박스가 된다. 쌓임 기준은 대신 안쪽 세 줄에 준다.
        <Link
          href={`/projects/${featured.projectId}`}
          className="group flex flex-col after:absolute after:inset-0 focus-visible:outline-none"
        >
          <div className="relative flex w-fit">
            <DdayBadge days={days} onGradient />
          </div>
          {/* 고양이(폭 132 + right-3)가 콘텐츠 상자를 96px 파고든다. 그만큼 비우고,
              긴 이름은 줄바꿈 대신 자른다 — 배너가 세로로 늘면 옆 시험 일정 열이 따라 늘어난다. */}
          <h3 className="text-heading-md relative mt-2 truncate pr-24 font-semibold text-gray-800">
            {examName(featured)}
          </h3>
          {/* 쉴 때는 진행률, 손을 얹으면 «학습하러 가기» — 한 칸을 둘이 나눠 쓴다.
              grid로 같은 셀에 겹쳐 두는 이유는 칸 높이를 숫자로 못 박지 않기 위해서다.
              높이는 둘 중 큰 쪽(진행률 34: 라벨 22 + 8 + 바 4)이 정하고, 짧은 쪽은
              items-center로 가운데 선다. absolute로 얹으면 그 34를 손으로 적어야 한다.
              hover만이 아니라 focus-visible에도 바꾼다 — 키보드에는 호버가 없다.

              폭은 둘이 나눠 잡는다. 넓은 화면에서는 상한(400)이 잡고, 좁아지면 mr-32가
              잡는다 — 고양이 왼쪽까지가 96px인데 딱 붙어 보여서 32px을 더 뗀 값이다.
              둘 중 하나만 두면 한쪽 폭에서 바가 고양이 밑으로 들어간다. */}
          <div className="relative mt-2 mr-32 grid max-w-100 items-center">
            {progress !== null && (
              // 라벨과 바를 직접 그리고 있었다. 채움이 bg-gray-900이라 토큰에 없어 85%인데도
              // 아무것도 안 채워졌고, 값 글자도 text-gray-950으로 안 보이고 있었다.
              // 주차 목록 머리의 진행률과 같은 부품을 부른다.
              <div className="col-start-1 row-start-1 transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0">
                <LearningProgress percent={progress} />
              </div>
            )}
            {/* 배너 전체가 링크라 이게 유일한 진입 신호다. 진행률이 없으면(백엔드가 값을
                안 주는 동안) 가릴 것이 없으니 그냥 서 있는다. */}
            <span
              className={cn(
                'text-body col-start-1 row-start-1 flex w-fit items-center gap-1 font-medium text-gray-800',
                progress !== null &&
                  'opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
              )}
            >
              학습하러 가기
              <Icon name="arrow-right" size={16} />
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}

// 시험 일정이 하나도 없을 때의 배너(시안 별도 상태).
// 높이는 진행 중 배너와 같게 맞춘다 — 다르면 둘 사이를 오갈 때 그리드 1행이 흔들린다.
function EmptyExamBanner() {
  return (
    <div className={cn(SHELL, 'items-center justify-center gap-0.5')}>
      <GradientBackground layer variant="banner" />
      {/* 글이 가운데 서므로 낙서는 왼쪽으로 비켜 둔다(채워진 쪽은 67%). */}
      <BannerDecor doodleAt="left-[10%]" />
      <p className="text-heading-sm relative font-semibold text-gray-800">
        예정된 시험 일정이 없어요.
      </p>
      <p className="text-body relative text-gray-500">
        새로운 시험이 등록되면 이곳에 표시돼요.
      </p>
    </div>
  );
}
