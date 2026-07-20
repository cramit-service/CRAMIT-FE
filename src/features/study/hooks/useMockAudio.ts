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
  const [rawTime, setRawTime] = useState(MOCK_START_TIME);

  // duration이 MOCK_START_TIME보다 짧으면 "12:05 / 01:00"처럼 재생 위치가
  // 길이를 넘어서고 진행바도 100%를 넘는다.
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
