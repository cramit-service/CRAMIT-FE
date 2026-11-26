'use client';
// src/features/landing/components/Motion.tsx
import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { prefersReducedMotion } from '@/features/landing/hooks/useInView';
import styles from './motion.module.css';

// 안의 조각들이 화면에 들어오면 움직이고 나가면 멈춘다.
// data-motion이 없으면(JS 전·움직임 줄이기) 움직임 없이 끝 상태로 보인다.
export function Motion({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;
    node.dataset.motion = 'armed';
    const observer = new IntersectionObserver(
      ([entry]) => {
        node.dataset.motion = entry.isIntersecting ? 'play' : 'pause';
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn(styles.root, className)}>
      {children}
    </div>
  );
}
