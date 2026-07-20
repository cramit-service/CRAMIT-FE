'use client';
// src/features/study/hooks/useMockAudio.ts
import { useEffect, useState } from 'react';

// TODO(오디오): 백엔드가 녹음 파일(audioUrl)을 내려주면 <audio> 엘리먼트를 붙이고
// 이 훅을 실제 timeupdate/play/pause 이벤트 기반으로 교체한다.
// 지금은 재생 상태 토글과 진행바 UI만 확인할 수 있게 흉내낸다.

// Figma 시안 표기(12:05 / 61:02)와 맞추기 위한 mock 시작 위치(초)
const MOCK_START_TIME = 725;

export function useMockAudio(duration: number) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(MOCK_START_TIME);

  // 재생 중일 때만 1초씩 흘려보낸다 (mock)
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev + 1 >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  // 끝까지 재생된 상태에서 다시 누르면 처음부터
  const toggle = () => {
    setIsPlaying((prev) => {
      if (!prev && currentTime >= duration) setCurrentTime(0);
      return !prev;
    });
  };

  // 진행바 클릭으로 위치 이동 (0~duration으로 자른다)
  const seek = (seconds: number) => {
    setCurrentTime(Math.min(duration, Math.max(0, Math.round(seconds))));
  };

  return { isPlaying, currentTime, toggle, seek };
}
