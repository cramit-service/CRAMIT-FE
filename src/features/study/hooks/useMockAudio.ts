'use client';
// src/features/study/hooks/useMockAudio.ts
import { useEffect, useRef, useState } from 'react';

// 뷰어 화면이 쥐고 탭들에 내려주는 재생 상태.
// 이름은 목 시절 그대로 둔다. 탭들이 이 인터페이스만 보므로 실제 재생으로 바꿔도 탭은 그대로다.
export interface MockAudio {
  isPlaying: boolean;
  currentTime: number; // 초
  toggle: () => void;
  seek: (seconds: number) => void;
}

// src는 R2 공개 URL. 녹음이 없는 주차는 null이라 재생 버튼이 아무 일도 하지 않는다.
// duration은 서버가 준 녹음 길이라 실제 파일 길이와 1초쯤 어긋날 수 있어, 읽는 시점에 0~duration으로 자른다.
export function useMockAudio(src: string | null, duration: number): MockAudio {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rawTime, setRawTime] = useState(0);

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audio.preload = 'metadata';
    audioRef.current = audio;

    // timeupdate는 1초에 여러 번 온다. 초 단위로 내려 같은 값이면 다시 그리지 않게 한다.
    const onTime = () => setRawTime(Math.floor(audio.currentTime));
    const onPlay = () => setIsPlaying(true);
    const onStop = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onStop);
    audio.addEventListener('ended', onStop);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onStop);
      audio.removeEventListener('ended', onStop);
      audio.pause();
      audio.removeAttribute('src');
      audioRef.current = null;
    };
  }, [src]);

  const safeDuration = Math.max(0, duration);
  const currentTime = Math.min(Math.max(0, rawTime), safeDuration);

  // 끝까지 재생된 상태에서 다시 누르면 처음부터
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    if (audio.ended || currentTime >= safeDuration) audio.currentTime = 0;
    audio.play().catch(() => setIsPlaying(false));
  };

  // 진행바 클릭으로 위치 이동 (0~duration으로 자른다)
  const seek = (seconds: number) => {
    const next = Math.min(safeDuration, Math.max(0, Math.round(seconds)));
    setRawTime(next);
    if (audioRef.current) audioRef.current.currentTime = next;
  };

  return { isPlaying, currentTime, toggle, seek };
}
