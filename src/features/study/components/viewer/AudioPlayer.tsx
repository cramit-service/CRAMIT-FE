'use client';
// src/features/study/components/viewer/AudioPlayer.tsx
import { formatPlayTime } from '../../lib/format';
import { PauseIcon, PlayIcon } from './icons';

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
    <div className="flex h-[70px] shrink-0 items-center gap-4 pr-11 pl-8">
      <p className="text-[14px] leading-[22px] font-medium tracking-[-0.28px] whitespace-nowrap text-white">
        PDF 강의자료 ({currentPage}/{pageCount})
      </p>

      {/* 우측: 재생/일시정지 + 진행바 + 시간 */}
      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-5">
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
          className="w-[276px] max-w-full min-w-[80px] shrink py-2"
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
