'use client';
// src/features/project/components/FileDropzone.tsx
import { useId, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { CloudUploadIcon } from './icons';
import {
  UPLOAD_SPEC,
  formatFileSize,
  validateUpload,
} from '@/features/project/lib/upload';
import type { UploadKind } from '@/features/project/lib/upload';

interface FileDropzoneProps {
  kind: UploadKind;
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  /** 검증 실패 문구. 부모가 들고 있어야 제출 시 함께 초기화된다. */
  error: string | null;
  onError: (message: string | null) => void;
  disabled?: boolean;
  /** 수정 모드에서 이미 올라가 있는 파일의 이름. 새로 고르지 않으면 이 파일이 유지된다. */
  existingFileName?: string | null;
}

// 강의 자료(PDF) / 음성 파일을 끌어다 놓거나 클릭해서 고르는 영역.
// Figma 시안(387×270)을 화면 전체와 같은 0.72배로 줄인 값을 쓴다.
export function FileDropzone({
  kind,
  label,
  file,
  onChange,
  error,
  onError,
  disabled,
  existingFileName,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const [dragging, setDragging] = useState(false);
  const spec = UPLOAD_SPEC[kind];
  // 드롭존이 2개 나란히 있어서 "파일 선택"·"삭제"만으로는 어느 쪽인지 알 수 없다.
  // 스크린리더가 읽을 이름에 종류("강의 자료"/"음성 파일")를 붙인다.
  const describedBy = error ? errorId : undefined;

  // 파일 하나를 받아 검증 후 부모에 올린다. 실패하면 선택을 비우고 문구만 남긴다.
  const accept = (picked: File | undefined) => {
    if (!picked) return;
    const message = validateUpload(picked, kind);
    onError(message);
    onChange(message ? null : picked);
  };

  const openPicker = () => inputRef.current?.click();

  // 칸 안에서 쓰는 밑줄 액션 버튼. "다시 선택"·"파일 교체"가 같은 생김새를 쓴다.
  const LINK_ACTION =
    'rounded-sm px-2 py-1 text-[11px] leading-4 text-gray-300 underline underline-offset-2 transition-colors hover:text-gray-100 disabled:cursor-not-allowed disabled:text-gray-600';

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    // 여러 개를 떨어뜨려도 한 칸에 하나만 받는다.
    accept(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 모달 안 타이포는 박스와 같은 0.72배로 옮긴다 (라벨 20 → 14). */}
      <p className="text-[14px] leading-[22px] tracking-[-0.28px] text-gray-300">
        {label}
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'h-[194px] rounded-md border border-dashed bg-gray-800 transition-colors',
          // 파일을 끌고 오면 테두리로 "여기에 놓으면 된다"를 알린다.
          dragging ? 'border-secondary-400 bg-gray-700' : 'border-gray-400',
        )}
      >
        {/* 같은 파일을 지웠다가 다시 고르면 change가 안 뜬다. value를 비워 매번 뜨게 한다. */}
        <input
          ref={inputRef}
          type="file"
          accept={spec.accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        {file ? (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 px-4 text-center">
            <CloudUploadIcon className="text-secondary-400 size-4" />
            <p className="max-w-full truncate text-[12px] leading-[18px] tracking-[-0.24px] text-gray-100">
              {file.name}
            </p>
            <p className="text-[11px] leading-4 tracking-[-0.22px] text-gray-600">
              {formatFileSize(file.size)}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <button
                type="button"
                onClick={openPicker}
                disabled={disabled}
                aria-label={`${spec.label} 파일 다시 고르기`}
                aria-describedby={describedBy}
                className={LINK_ACTION}
              >
                다시 선택
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  onError(null);
                }}
                disabled={disabled}
                aria-label={`${spec.label} 파일 삭제`}
                className="text-error rounded-sm px-2 py-1 text-[11px] leading-4 underline underline-offset-2 transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:text-gray-600"
              >
                삭제
              </button>
            </div>
          </div>
        ) : existingFileName ? (
          // 수정 모드에서 이미 올라가 있는 파일. 이 칸을 빈 채로 두면 "파일이 날아갔다"로 읽혀
          // 사용자가 같은 파일을 다시 올리게 된다(200MB짜리 녹음이 그대로 재전송된다).
          // 새로 고르기 전까지는 이 파일이 유지된다는 걸 문구로도 말해 준다.
          <div className="flex size-full flex-col items-center justify-center gap-1.5 px-4 text-center">
            <CloudUploadIcon className="size-4 text-gray-500" />
            <p className="max-w-full truncate text-[12px] leading-[18px] tracking-[-0.24px] text-gray-300">
              {existingFileName}
            </p>
            <p className="text-[11px] leading-4 tracking-[-0.22px] text-gray-600">
              이미 올라간 파일이에요
            </p>
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled}
              aria-label={`${spec.label} 파일 교체하기`}
              aria-describedby={describedBy}
              className={cn(LINK_ACTION, 'mt-0.5')}
            >
              파일 교체
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            aria-label={`${spec.label} 파일 고르기`}
            aria-describedby={describedBy}
            className="flex size-full cursor-pointer flex-col items-center justify-center gap-1.5 px-4 text-center disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-1.5 text-[12px] leading-[18px] tracking-[-0.24px] text-gray-300">
              <CloudUploadIcon className="size-4" />
              파일 선택
            </span>
            <span className="text-[11px] leading-4 tracking-[-0.22px] text-gray-600">
              {spec.hint}
              <br />
              {spec.formatHint}
            </span>
          </button>
        )}
      </div>

      {/* 파일을 고른 직후 나타나는 문구라 보조기기가 바로 읽도록 alert로 둔다. */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-error text-[12px] leading-[18px] tracking-[-0.24px] break-keep"
        >
          {error}
        </p>
      )}
    </div>
  );
}
