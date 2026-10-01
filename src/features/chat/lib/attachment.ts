// src/features/chat/lib/attachment.ts
// 채팅 질문에 붙이는 파일 1개의 제약과 검사.
// 강의자료 업로드(features/project)와는 허용 형식·크기가 달라 따로 둔다.
// TODO(정리): formatFileSize는 project/lib/upload.ts와 같다. shared/lib로 올리는 건 후속 PR.

const MB = 1024 * 1024;

// MIME은 브라우저·OS마다 제각각이라 검사는 확장자로 하고,
// accept에는 파일 선택창 편의를 위해 MIME도 함께 적는다.
export const ATTACHMENT_EXTENSIONS = [
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.txt',
] as const;

export const ATTACHMENT_ACCEPT =
  '.pdf,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain';

export const ATTACHMENT_MAX_BYTES = 10 * MB;

// 1024 → "1.0KB", 10485760 → "10.0MB"
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / MB).toFixed(1)}MB`;
}

// 통과하면 null, 걸리면 사용자에게 보여줄 문구를 돌려준다.
export function validateAttachment(file: File): string | null {
  const lower = file.name.toLowerCase();
  if (!ATTACHMENT_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return `${ATTACHMENT_EXTENSIONS.join(', ')} 파일만 올릴 수 있어요.`;
  }
  if (file.size > ATTACHMENT_MAX_BYTES) {
    return `파일이 너무 커요. ${formatFileSize(ATTACHMENT_MAX_BYTES)}까지 올릴 수 있어요. (현재 ${formatFileSize(file.size)})`;
  }
  if (file.size === 0) {
    return '빈 파일이에요. 내용이 있는 파일을 골라주세요.';
  }
  return null;
}
