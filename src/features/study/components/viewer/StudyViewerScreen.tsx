'use client';
// src/features/study/components/viewer/StudyViewerScreen.tsx
import { useEffect, useRef, useState } from 'react';
import { useProjectDetail } from '@/features/study/hooks/useProjectDetail';
import {
  useChapter,
  useLectureMaterial,
} from '@/features/study/hooks/useLectureMaterial';
import { useMockAudio } from '@/features/study/hooks/useMockAudio';
import { ViewerHeader } from '@/features/study/components/viewer/ViewerHeader';
import { PdfMaterialTab } from '@/features/study/components/viewer/PdfMaterialTab';
import { SummaryTab } from '@/features/study/components/viewer/SummaryTab';
import { ScriptTab } from '@/features/study/components/viewer/ScriptTab';
import { TabPlaceholder } from '@/features/study/components/viewer/TabPlaceholder';
import { Resizer } from '@/features/study/components/viewer/Resizer';
import { Button } from '@/shared/ui/Button';
import type { ViewerTab } from '@/shared/types/api';

interface StudyViewerScreenProps {
  projectId: string;
  chapterId: string;
}

// 이분할일 때 두 패널 사이 간격 = 드래그 핸들 폭(Resizer의 w-3).
// 시안은 14px(×0.72 ≈ 10)이지만 패널 안쪽 핸들과 같은 잡는 폭을 유지하려고 12px로 둔다.
// 여기 값이 핸들 실제 폭과 어긋나면 좌우 비율 계산이 그만큼 밀린다.
const SPLIT_GAP = 12;
// 좌측 패널이 가져갈 수 있는 비율(%) 범위. 어느 쪽도 쓸모없이 좁아지지 않게 막는다.
const MIN_RATIO = 30;
const MAX_RATIO = 70;

// 학습 뷰어(챕터 "학습하기" 진입) 화면. page.tsx는 이 컴포넌트를 조립만 한다.
export function StudyViewerScreen({
  projectId,
  chapterId,
}: StudyViewerScreenProps) {
  // 켜져 있는 탭 목록. 1개면 단일, 2개면 이분할이고 배열 순서가 곧 좌→우 순서다.
  const [activeTabs, setActiveTabs] = useState<ViewerTab[]>(['PDF']);
  // 좌측 패널이 차지하는 비율(%)
  const [leftRatio, setLeftRatio] = useState(50);
  // 드래그 이동량(px)을 비율(%)로 바꾸려면 지금 분할 영역의 실제 폭이 필요하다.
  const splitRef = useRef<HTMLDivElement>(null);
  const [splitWidth, setSplitWidth] = useState(0);

  const projectQuery = useProjectDetail(projectId);
  const chapterQuery = useChapter(projectId, chapterId);
  const materialQuery = useLectureMaterial(chapterId);

  // 재생 상태는 탭이 아니라 화면이 쥔다. 탭 안에 두면 탭을 옮길 때마다 언마운트돼
  // 재생 위치가 초기화되고, 원문 스크립트 탭이 그 값을 읽을 방법도 없다.
  // 조회 전에는 duration이 0이지만 훅이 읽는 시점에만 잘라내므로 도착하면 복원된다.
  const audio = useMockAudio(materialQuery.data?.audioDuration ?? 0);

  const isSplit = activeTabs.length === 2;

  // 창 크기가 바뀌어도 비율↔px 환산이 어긋나지 않게 분할 영역 폭을 추적한다.
  useEffect(() => {
    const el = splitRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setSplitWidth(entry.contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isSplit]);

  // 탭은 고르는 게 아니라 켜고 끄는 것이다(시안의 이분할 화면에서 둘이 동시에 켜져 있다).
  const toggleTab = (tab: ViewerTab) =>
    setActiveTabs((prev) => {
      // 마지막 하나까지 끄면 빈 화면이 된다. 켜진 게 하나뿐이면 그대로 둔다.
      if (prev.includes(tab)) {
        return prev.length === 1 ? prev : prev.filter((t) => t !== tab);
      }
      // 새로 켠 탭은 오른쪽에 붙는다(= 보던 탭이 제자리인 왼쪽에 남는다).
      // 이미 둘이면 가장 먼저 켠 왼쪽을 밀어내 항상 최근 둘만 남긴다.
      return prev.length < 2 ? [...prev, tab] : [prev[1], tab];
    });

  const queries = [projectQuery, chapterQuery, materialQuery];

  // 로딩 / 에러 / 빈 데이터를 구분한다.
  // 셋을 뭉뚱그려 falsy로 판단하면 조회에 실패해도 "불러오는 중…"에서 멈춘다.
  if (queries.some((q) => q.isPending)) {
    return <div className="p-10 text-gray-500">불러오는 중…</div>;
  }

  if (queries.some((q) => q.isError)) {
    return (
      <div className="flex flex-col items-start gap-4 p-10">
        <p className="text-gray-700">
          학습 자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queries.forEach((q) => q.refetch())}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  const project = projectQuery.data;
  const chapter = chapterQuery.data;
  const material = materialQuery.data;

  // 성공했는데 본문이 비어 있는 경우 (204 등)
  if (!project || !chapter || !material) {
    return (
      <div className="p-10 text-gray-500">표시할 학습 자료가 없습니다.</div>
    );
  }

  // 탭 하나를 그린다. 단일 화면이든 이분할 한 칸이든 내용은 같다.
  const renderTab = (tab: ViewerTab) => {
    switch (tab) {
      case 'PDF':
        return <PdfMaterialTab material={material} audio={audio} />;
      // 요약은 이 탭에서만 필요하니 화면 진입 시가 아니라 탭 안에서 따로 조회한다
      case 'SUMMARY':
        return <SummaryTab chapterId={chapterId} />;
      // 스크립트도 같은 이유로 탭 안에서 조회한다. 재생 위치는 읽기 전용으로 넘긴다
      case 'SCRIPT':
        return (
          <ScriptTab
            chapterId={chapterId}
            currentTime={audio.currentTime}
            duration={material.audioDuration}
          />
        );
      // TODO(todo 담당): TODO 탭은 다른 담당 영역이라 자리만 잡아둔다
      case 'TODO':
        return <TabPlaceholder label="TODO 탭은 담당자가 구현합니다." />;
    }
  };

  return (
    // Figma 시안은 1920 기준 절대 px라 실제 화면(사이드바 제외)에선 과하게 커진다.
    // 챕터 상세 화면과 같은 약 0.72배 축소 비율을 그대로 따른다.
    <div className="mx-auto w-full max-w-[1152px] px-8 pt-12 pb-12">
      <ViewerHeader
        chapter={chapter}
        project={project}
        activeTabs={activeTabs}
        onTabToggle={toggleTab}
      />

      <div className="mt-5">
        {isSplit ? (
          // 이분할 — 좌우 패널 사이 핸들을 끌어 폭을 나눈다.
          // 핸들이 간격을 겸하므로 flex gap은 주지 않는다(주면 간격이 두 번 생긴다).
          <div ref={splitRef} className="flex">
            <div
              className="min-w-0"
              // 핸들 폭을 뺀 나머지를 비율로 가른다. 우측은 flex-1로 남는 만큼 채운다.
              style={{
                flexBasis: `calc((100% - ${SPLIT_GAP}px) * ${leftRatio / 100})`,
                flexGrow: 0,
                flexShrink: 0,
              }}
            >
              {renderTab(activeTabs[0])}
            </div>
            <Resizer
              label="좌우 패널 너비 조절"
              value={leftRatio}
              min={MIN_RATIO}
              max={MAX_RATIO}
              onResize={setLeftRatio}
              // 이동 1px이 몇 %인지. 폭을 재기 전(0)에는 드래그해도 움직이지 않는다.
              scale={splitWidth > 0 ? 100 / splitWidth : 0}
              step={2}
            />
            <div className="min-w-0 flex-1">{renderTab(activeTabs[1])}</div>
          </div>
        ) : (
          renderTab(activeTabs[0])
        )}
      </div>
    </div>
  );
}
