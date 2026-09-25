'use client';
// src/features/study/components/viewer/AudioPlayer.tsx
import { formatPlayTime } from '@/features/study/lib/format';
import { IconButton } from '@/shared/ui/IconButton';
import { Toggle } from '@/shared/ui/Toggle';

interface AudioPlayerProps {
  currentPage: number;
  pageCount: number;
  /** 옆의 페이지 목록이 열려 있는지. 몇 쪽인지를 말하는 자리가 곧 그 스위치다. */
  listOpen: boolean;
  onToggleList: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number; // 초
  duration: number; // 초
  onSeek: (seconds: number) => void;
}

// 학습 뷰어 상단 오디오 플레이어 (Figma: 어두운 패널 상단 줄).
// TODO(오디오): 실제 재생은 백엔드 audioUrl 확정 후. 지금은 mock 시간값으로 UI만 동작한다.
// TODO(매핑): "해당 페이지 수업 듣기"(페이지↔오디오 구간 매핑)는 백엔드 데이터가 필요해 미구현.
export function AudioPlayer({
  currentPage,
  pageCount,
  listOpen,
  onToggleList,
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
}: AudioPlayerProps) {
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 진행바를 클릭한 가로 위치를 재생 위치로 환산한다
  const handleSeek = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    onSeek(((e.clientX - rect.left) / rect.width) * duration);
  };

  return (
    // 이분할에서 이 줄이 가장 먼저 좁아진다. 창이 아니라 줄 자체의 폭을 봐야 해서
    // @container를 건다(스크립트 구간 머리글과 같은 방식).
    <div className="@container flex h-[70px] shrink-0 items-center justify-between gap-4 pr-11 pl-8">
      {/* 몇 쪽인지 말하는 자리를 그대로 스위치로 쓴다. 무슨 자료인지는 위의 탭이
          이미 말하고 있어서 "PDF 강의자료"는 같은 말을 두 번 하는 것이었다.
          목록의 배지와 같은 말(P.01)을 써서 둘이 같은 것을 가리킨다는 게 드러난다. */}
      <span className="shrink-0">
        <Toggle
          pressed={listOpen}
          size="sm"
          onClick={onToggleList}
          aria-label={listOpen ? '페이지 목록 닫기' : '페이지 목록 열기'}
        >
          P.{String(currentPage).padStart(String(pageCount).length, '0')} /{' '}
          {pageCount}
        </Toggle>
      </span>

      {/* 우측: 재생/일시정지 + 진행바 + 시간. 폭이 모자라면 이쪽이 진행바를 줄여 양보한다.
          flex-1(basis 0)이면 남는 폭을 다 가져가 라벨이 대신 눌리고,
          min-w-0면 제 콘텐츠보다 작아지면서 내용이 왼쪽으로 삐져나와 라벨을 덮는다.
          ml-auto도 못 쓴다 — 자동 마진이 붙으면 폭이 모자라도 줄지 않고 오른쪽으로
          넘쳐버린다. 그래서 우측 정렬은 부모의 justify-between으로 만든다. */}
      <div className="flex flex-1 items-center justify-end gap-5">
        {/* 연두는 글리프가 아니라 채움이다 (§2). */}
        <IconButton
          name={isPlaying ? 'pause' : 'play'}
          rank="primary"
          aria-label={isPlaying ? '일시정지' : '재생'}
          onClick={onTogglePlay}
        />

        <button
          type="button"
          onClick={handleSeek}
          aria-label="재생 위치 이동"
          // 폭을 w-[276px]로 못 박으면 그 값이 부모 그룹의 자동 최소 크기가 돼서,
          // min-w를 줘도 그룹이 그 밑으로 줄지 못하고 통째로 오른쪽으로 넘친다.
          // 고정 폭 대신 "남는 만큼 늘리되 276까지"로 두면 필요할 때 알아서 줄어든다.
          // 그래도 안 들어가는 구간(라벨 137 + 최소 우측 223 = 360)부터는 아예 뺀다.
          className="max-w-[276px] min-w-[80px] flex-1 basis-0 py-2 @max-[380px]:hidden"
        >
          <span className="block h-1.5 w-full rounded-full bg-gray-200">
            {/* 연두가 안 보이던 건 밝기 때문이다. lime-action은 L*가 95.1이라 밝은
                표면 위에서는 밝기 차가 안 난다(§2: "캔버스 위에서 연두는 흐린 게 아니라
                없다"). 연두를 바꾸는 대신 뒤를 어둡게 한다 — gray-200 트랙에서 ΔL* 17이다.
                그보다 어두운 트랙(gray-400)은 남은 시간이 지난 시간보다 눈에 띄어
                말하려는 것이 뒤집힌다.
                두께 6은 어느 램프에도 없다. §2가 과목 색 막대에 대해 인정한 것과 같다 —
                색 표시는 타이포도 간격도 아이콘도 아니라 램프가 닿지 않는다. */}
            <span
              className="bg-lime-action block h-full rounded-full"
              style={{ width: `${percent}%` }}
            />
          </span>
        </button>

        <p className="text-label font-medium whitespace-nowrap text-white tabular-nums">
          {formatPlayTime(currentTime)} / {formatPlayTime(duration)}
        </p>
      </div>
    </div>
  );
}
