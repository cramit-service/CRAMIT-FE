'use client';
// src/features/study/hooks/useMockAudio.ts
import { useEffect, useRef, useState } from 'react';

// 뷰어 화면이 쥐고 탭들에 내려주는 재생 상태.
// 이름은 목 시절 그대로 둔다. 탭들이 이 인터페이스만 보므로 실제 재생으로 바꿔도 탭은 그대로다.
export interface MockAudio {
  isPlaying: boolean;
  currentTime: number; // 초
  duration: number; // 초
  canPlay: boolean; // 녹음이 있고 불러오다 실패하지 않았다
  failed: boolean; // 녹음 파일을 불러오지 못했다
  toggle: () => void;
  seek: (seconds: number) => void;
  playFrom: (seconds: number) => void; // 스크립트 문장의 시각을 누르면 그 시각부터 재생
}

// src는 R2 공개 URL. 녹음이 없는 주차는 null이라 재생할 것이 없다.
// fallbackDuration은 서버가 준 녹음 길이다. 비어 있으면 0이라, 파일을 읽어 길이를 알게 되면 그쪽을 쓴다.
// lookupFailed는 녹음 조회 자체가 실패한 경우다. 파일을 받다 실패한 경우와 함께 failed로 모은다.
export function useMockAudio(
  src: string | null,
  fallbackDuration: number,
  lookupFailed: boolean,
): MockAudio {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rawTime, setRawTime] = useState(0);
  const [fileDuration, setFileDuration] = useState<number | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audio.preload = 'metadata';
    audioRef.current = audio;

    // timeupdate는 1초에 여러 번 온다. 초 단위로 내려 같은 값이면 다시 그리지 않게 한다.
    const onTime = () => setRawTime(Math.floor(audio.currentTime));
    const onPlay = () => setIsPlaying(true);
    const onStop = () => setIsPlaying(false);
    const onMeta = () => {
      if (Number.isFinite(audio.duration)) {
        setFileDuration(Math.floor(audio.duration));
      }
    };
    const onError = () => {
      setLoadFailed(true);
      setIsPlaying(false);
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onStop);
    audio.addEventListener('ended', onStop);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('error', onError);

    return () => {
      // pause 이벤트는 리스너를 떼기 전에 받지만 비동기로 온다. 상태는 여기서 직접 되돌린다.
      audio.pause();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onStop);
      audio.removeEventListener('ended', onStop);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('error', onError);
      // src를 빼고 load()까지 불러야 받던 다운로드가 멈춘다
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
      setIsPlaying(false);
      setRawTime(0);
      setFileDuration(null);
      setLoadFailed(false);
    };
  }, [src]);

  const duration = Math.max(0, fileDuration ?? fallbackDuration);
  const currentTime = Math.min(Math.max(0, rawTime), duration);
  const failed = lookupFailed || loadFailed;
  const canPlay = src !== null && !failed;

  // 끝까지 재생된 상태에서 다시 누르면 처음부터
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !canPlay) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    if (audio.ended || currentTime >= duration) audio.currentTime = 0;
    audio.play().catch(() => setIsPlaying(false));
  };

  // 진행바 클릭으로 위치 이동 (0~duration으로 자른다)
  const seek = (seconds: number) => {
    const next = Math.min(duration, Math.max(0, Math.round(seconds)));
    setRawTime(next);
    if (audioRef.current) audioRef.current.currentTime = next;
  };

  const playFrom = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !canPlay) return;
    seek(seconds);
    audio.play().catch(() => setIsPlaying(false));
  };

  return {
    isPlaying,
    currentTime,
    duration,
    canPlay,
    failed,
    toggle,
    seek,
    playFrom,
  };
}
