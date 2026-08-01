'use client';
// src/features/study/components/viewer/AudioPlayer.tsx
import { formatPlayTime } from '@/features/study/lib/format';
import { PauseIcon, PlayIcon } from '@/features/study/components/viewer/icons';

interface AudioPlayerProps {
  currentPage: number;
  pageCount: number;
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
      {/* 어느 자료의 몇 페이지인지가 이 줄에서 가장 중요하다. 줄이지 않는다. */}
      <p className="shrink-0 text-[14px] leading-[22px] font-medium tracking-[-0.28px] whitespace-nowrap text-white">
        PDF 강의자료 ({currentPage}/{pageCount})
      </p>

      {/* 우측: 재생/일시정지 + 진행바 + 시간. 폭이 모자라면 이쪽이 진행바를 줄여 양보한다.
          flex-1(basis 0)이면 남는 폭을 다 가져가 라벨이 대신 눌리고,
          min-w-0면 제 콘텐츠보다 작아지면서 내용이 왼쪽으로 삐져나와 라벨을 덮는다.
          ml-auto도 못 쓴다 — 자동 마진이 붙으면 폭이 모자라도 줄지 않고 오른쪽으로
          넘쳐버린다. 그래서 우측 정렬은 부모의 justify-between으로 만든다. */}
      <div className="flex flex-1 items-center justify-end gap-5">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? '일시정지' : '재생'}
          className="text-primary-400 flex size-7 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
        >
          {isPlaying ? (
            <PauseIcon className="size-5" />
          ) : (
            <PlayIcon className="size-5" />
          )}
        </button>

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
          <span className="block h-[3px] w-full rounded-full bg-gray-500">
            {/* 진행분은 연두(primary) — 시그니처 강조 역할 */}
            <span
              className="bg-primary-400 block h-full rounded-full"
              style={{ width: `${percent}%` }}
            />
          </span>
        </button>

        <p className="text-[14px] leading-[22px] font-medium tracking-[-0.28px] whitespace-nowrap text-white tabular-nums">
          {formatPlayTime(currentTime)} / {formatPlayTime(duration)}
        </p>
      </div>
    </div>
  );
}
