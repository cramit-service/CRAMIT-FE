'use client';
// src/features/study/hooks/useMockAudio.ts
import { useEffect, useState } from 'react';

// TODO(오디오): 백엔드가 녹음 파일(audioUrl)을 내려주면 <audio> 엘리먼트를 붙이고
// 이 훅을 실제 timeupdate/play/pause 이벤트 기반으로 교체한다.
// 지금은 재생 상태 토글과 진행바 UI만 확인할 수 있게 흉내낸다.

// 뷰어 화면이 쥐고 탭들에 내려주는 재생 상태.
export interface MockAudio {
  isPlaying: boolean;
  currentTime: number; // 초
  toggle: () => void;
  seek: (seconds: number) => void;
}

// duration은 강의자료 조회가 끝나기 전엔 0으로 들어온다.
// 실제 녹음 길이를 쓰므로 처음부터 재생한다. 시안의 12:05 시작은 길이가 그보다
// 짧은 녹음에서 끝에 붙어 다 들은 것처럼 보였다.
export function useMockAudio(duration: number): MockAudio {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rawTime, setRawTime] = useState(0);

  // 옮겨 둔 위치보다 duration이 짧아지면 재생 위치가 길이를 넘어서고 진행바도 100%를 넘는다.
  // 상태를 따로 보정하지 않고 읽는 시점에 0~duration으로 자른다.
  // 이러면 자료가 바뀌어 duration이 줄어도 자동으로 따라간다.
  const safeDuration = Math.max(0, duration);
  const currentTime = Math.min(Math.max(0, rawTime), safeDuration);

  // 재생 중일 때만 1초씩 흘려보낸다 (mock)
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setRawTime((prev) => {
        if (prev + 1 >= safeDuration) {
          setIsPlaying(false);
          return safeDuration;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, safeDuration]);

  // 끝까지 재생된 상태에서 다시 누르면 처음부터
  const toggle = () => {
    setIsPlaying((prev) => {
      if (!prev && currentTime >= safeDuration) setRawTime(0);
      return !prev;
    });
  };

  // 진행바 클릭으로 위치 이동 (0~duration으로 자른다)
  const seek = (seconds: number) => {
    setRawTime(Math.min(safeDuration, Math.max(0, Math.round(seconds))));
  };

  return { isPlaying, currentTime, toggle, seek };
}
