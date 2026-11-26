'use client';
// src/features/landing/components/Desk.tsx
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/lib/cn';
import {
  prefersReducedMotion,
  useInView,
} from '@/features/landing/hooks/useInView';
import styles from './motion.module.css';

// 창 그림은 public/landing/desk/에 있다. 다른 앱의 색이라 우리 토큰이 아니어서 그림 파일로 뺐다.
// 좌표는 그림을 뽑은 1120×660 바탕화면 기준이다.
const STAGE_W = 1120;
const WINDOWS = [
  { id: 'pdf', name: 'PDF 뷰어', x: 16, y: 62, w: 500, h: 366 },
  { id: 'memo', name: '메모', x: 36, y: 424, w: 440, h: 222 },
  { id: 'rec', name: '녹음', x: 388, y: 40, w: 460, h: 236 },
  { id: 'note', name: '필기', x: 478, y: 262, w: 390, h: 350 },
  { id: 'ai', name: 'AI 챗봇', x: 716, y: 50, w: 392, h: 372 },
  { id: 'cal', name: '캘린더', x: 740, y: 404, w: 368, h: 244 },
  { id: 'todo', name: '할 일', x: 592, y: 470, w: 250, h: 178 },
] as const;
type WindowId = (typeof WINDOWS)[number]['id'];

// 공부하는 순서대로 창을 한 번씩 꺼낸다. 창이 계속 바뀌는 것 자체가 '오간다'를 말한다
const HOP: WindowId[] = ['pdf', 'rec', 'memo', 'note', 'ai', 'cal', 'todo'];
const MOVE_MS = 720;
const STAY_MS = 900;

export function Desk() {
  const stageRef = useRef<HTMLDivElement>(null);
  // 뒤에서 앞 순서. 마지막이 맨 앞 창이다
  const [order, setOrder] = useState<WindowId[]>(WINDOWS.map((w) => w.id));
  const [cursor, setCursor] = useState({ x: 560, y: 300, clicks: 0 });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const front = order[order.length - 1];

  // 커서가 다음 창으로 가서 누르면 그 창이 맨 앞으로 온다
  const wrapRef = useInView<HTMLDivElement>((inView) => {
    clearTimeout(timer.current);
    if (!inView || prefersReducedMotion()) return;
    let k = 0;
    const step = () => {
      const target = WINDOWS.find((w) => w.id === HOP[k])!;
      setCursor((c) => ({
        ...c,
        x: target.x + target.w * 0.55,
        y: target.y + 16,
      }));
      timer.current = setTimeout(() => {
        setOrder((o) => [...o.filter((id) => id !== target.id), target.id]);
        setCursor((c) => ({ ...c, clicks: c.clicks + 1 }));
        k = (k + 1) % HOP.length;
        timer.current = setTimeout(step, STAY_MS);
      }, MOVE_MS);
    };
    step();
  }, 0.2);

  // 바탕화면은 1120 폭으로 그리고 칸 폭에 맞춰 통째로 줄인다. 창 안 비율이 그대로 유지된다
  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;
    const fit = () =>
      stage.style.setProperty('--k', String(wrap.clientWidth / STAGE_W));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => {
      observer.disconnect();
      clearTimeout(timer.current);
    };
  }, [wrapRef]);

  return (
    // 장식이다. 같은 내용을 아래 불편 다섯 줄이 글로 말한다
    <div
      ref={wrapRef}
      aria-hidden
      className="shadow-far relative aspect-[1120/660] w-full overflow-hidden rounded-[14px]"
    >
      <div
        ref={stageRef}
        className="absolute top-0 left-0 h-[660px] w-[1120px] origin-top-left scale-(--k) [--k:1]"
      >
        <Image
          src="/landing/desk/wallpaper.webp"
          alt=""
          fill
          sizes="1200px"
          className="object-cover"
        />
        {/* 메뉴 막대의 앱 이름은 맨 앞 창을 따라 바뀐다. 나머지 메뉴는 바탕 그림에 있다 */}
        <span className="absolute top-1 left-3.5 text-[12.5px] leading-[18px] font-bold text-gray-800">
          {WINDOWS.find((w) => w.id === front)!.name}
        </span>

        {WINDOWS.map((w) => (
          <div
            key={w.id}
            className={cn(
              'absolute overflow-hidden rounded-[11px] backdrop-blur-2xl transition-shadow duration-300',
              front === w.id ? 'shadow-far' : 'shadow-near',
            )}
            style={{
              left: w.x,
              top: w.y,
              width: w.w,
              height: w.h,
              zIndex: order.indexOf(w.id) + 1,
            }}
          >
            <Image
              src={`/landing/desk/${w.id}.webp`}
              alt=""
              width={w.w}
              height={w.h}
              className="block"
            />
            {/* 맨 앞이 아닌 창은 창 버튼이 회색이다. 그림의 색 버튼 위를 덮는다 */}
            {front !== w.id && (
              <span className="absolute top-[17px] left-3.5 flex gap-2">
                <i className="size-3 rounded-full bg-gray-100" />
                <i className="size-3 rounded-full bg-gray-100" />
                <i className="size-3 rounded-full bg-gray-100" />
              </span>
            )}
          </div>
        ))}

        <span
          className="absolute z-10 size-[22px] transition-[left,top] duration-700 ease-[cubic-bezier(.3,.7,.2,1)]"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22">
            <path
              d="M3 2l14.5 9.2-6.4 1.3-3.3 5.9L3 2Z"
              className="stroke-surface fill-gray-800"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          {cursor.clicks > 0 && (
            <span
              key={cursor.clicks}
              className={cn(
                'border-sky-ink/60 absolute -top-[9px] -left-[9px] size-[22px] rounded-full border-2',
                styles.click,
              )}
            />
          )}
        </span>
      </div>
    </div>
  );
}
