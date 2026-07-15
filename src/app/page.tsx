// src/app/page.tsx
'use client';

import { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Button variant="danger" onClick={() => setOpen(true)}>
        회원 탈퇴
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-bold text-gray-900">정말 탈퇴하시겠습니까?</h2>
        <p className="mt-2 text-sm text-gray-600">
          회원 탈퇴 시 모든 학습 기록과 저장 정보가 영구적으로 삭제되며 복구할 수 없습니다.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={() => setOpen(false)}>
            확인
          </Button>
        </div>
      </Modal>
    </main>
  );
}