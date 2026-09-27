'use client';
// src/features/project/components/FileDropzone.tsx
import { useId, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import {
  UPLOAD_SPEC,
  formatFileSize,
  validateUpload,
} from '@/features/project/lib/upload';
import type { UploadKind } from '@/features/project/lib/upload';
import { Button } from '@/shared/ui/Button';
import { FileInput } from '@/shared/ui/FileInput';
import { Icon } from '@/shared/ui/Icon';

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

// 강의 자료(PDF) / 음성 파일을 끌어다 놓거나 눌러서 고르는 칸. Figma 시안 387×270.
//
// 칸 자체가 <label>이다. 전에는 상태마다 버튼이 따로 있었다 — 빈 칸엔 "파일 선택",
// 파일이 있으면 "다시 선택", 이미 올라간 파일엔 "파일 교체". 셋이 하는 일이 같은데
// 이름만 달랐고, 정작 칸의 나머지 면적은 아무 반응이 없었다.
// label이 되면 셋이 한 규칙으로 합쳐진다: 칸을 누르면 고른다.
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
  const inputId = useId();
  const errorId = useId();
  const [dragging, setDragging] = useState(false);
  const spec = UPLOAD_SPEC[kind];
  const describedBy = error ? errorId : undefined;

  // 파일 하나를 받아 검증 후 부모에 올린다. 실패하면 선택을 비우고 문구만 남긴다.
  const accept = (picked: File | undefined) => {
    if (!picked) return;
    const message = validateUpload(picked, kind);
    onError(message);
    onChange(message ? null : picked);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    // 여러 개를 떨어뜨려도 한 칸에 하나만 받는다.
    accept(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-[22px]">
      {/* 라벨은 시안 20px. */}
      <p className="text-body-md text-gray-700">{label}</p>

      {/* relative — 안의 input이 sr-only(=absolute)라 기준이 필요하다 (CLAUDE.md 4-6).
          focus-within — 이름도 글자도 없는 input이라 포커스가 어디 있는지 칸이 말해 준다. */}
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'bg-well relative flex h-[270px] flex-col items-center justify-center gap-2 rounded-md border border-dashed px-[22px] text-center transition-colors',
          // 파일을 끌고 오면 테두리로 "여기에 놓으면 된다"를 알린다.
          dragging ? 'border-sky-ink bg-sky-pale' : 'border-gray-300',
          'focus-within:border-sky-ink',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <FileInput
          id={inputId}
          accept={spec.accept}
          onPick={accept}
          disabled={disabled}
          // 드롭존이 둘 나란히 있어서 "파일 고르기"만으로는 어느 쪽인지 알 수 없다.
          aria-label={`${spec.label} 파일 고르기`}
          aria-describedby={describedBy}
        />

        {file ? (
          <>
            <span className="text-gray-700">
              <Icon name="cloud-upload" size={22} />
            </span>
            <p className="text-body-sm max-w-full truncate text-gray-800">
              {file.name}
            </p>
            <p className="text-label text-gray-500">
              {formatFileSize(file.size)} · 눌러서 다시 고르기
            </p>
          </>
        ) : existingFileName ? (
          // 수정 모드에서 이미 올라가 있는 파일. 이 칸을 빈 채로 두면 "파일이 날아갔다"로 읽혀
          // 사용자가 같은 파일을 다시 올리게 된다(200MB짜리 녹음이 그대로 재전송된다).
          // 새로 고르기 전까지는 이 파일이 유지된다는 걸 문구로도 말해 준다.
          <>
            <span className="text-gray-500">
              <Icon name="cloud-upload" size={16} />
            </span>
            <p className="text-body-sm max-w-full truncate text-gray-800">
              {existingFileName}
            </p>
            <p className="text-label text-gray-500">
              이미 올라간 파일이에요 · 눌러서 교체
            </p>
          </>
        ) : (
          <>
            <span className="text-body-sm flex items-center gap-2 text-gray-700">
              <Icon name="cloud-upload" size={22} />
              파일 선택
            </span>
            <span className="text-label text-gray-500">
              {spec.hint}
              <br />
              {spec.formatHint}
            </span>
          </>
        )}
      </label>

      {/* 삭제는 칸 밖에 선다 — label 안에 있으면 클릭이 label로 올라가 피커가 같이 열린다.
          고른 파일을 비우는 일이라 칸을 누르는 일(고르기)과 섞이면 안 된다. */}
      {file && (
        <div className="flex justify-center">
          <Button
            rank="secondary"
            size="sm"
            onClick={() => {
              onChange(null);
              onError(null);
            }}
            disabled={disabled}
            aria-label={`${spec.label} 파일 삭제`}
          >
            삭제
          </Button>
        </div>
      )}

      {/* 파일을 고른 직후 나타나는 문구라 보조기기가 바로 읽도록 alert로 둔다. */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-red-ink text-body-sm break-keep"
        >
          {error}
        </p>
      )}
    </div>
  );
}
