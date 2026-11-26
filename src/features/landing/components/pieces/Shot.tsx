// src/features/landing/components/pieces/Shot.tsx
import Image from 'next/image';
import { cn } from '@/shared/lib/cn';
import styles from '@/features/landing/components/motion.module.css';

// 실제 학습 화면을 잘라 둔 전·후 두 장(public/landing/cards/). 후 장면이 위에 겹쳐 번갈아 보인다.
// 움직이지 않을 때는 후 장면, 기능이 켜진 모습으로 멈춰 있다.
export function Shot({ name, sizes }: { name: string; sizes: string }) {
  return (
    <>
      <Image
        src={`/landing/cards/${name}-a.webp`}
        alt=""
        fill
        sizes={sizes}
        className="object-cover object-left-top"
      />
      <Image
        src={`/landing/cards/${name}-b.webp`}
        alt=""
        fill
        sizes={sizes}
        className={cn('object-cover object-left-top', styles.swap)}
      />
    </>
  );
}
