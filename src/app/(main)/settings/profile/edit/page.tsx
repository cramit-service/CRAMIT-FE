// src/app/(main)/settings/profile/edit/page.tsx
import { ProfileEditScreen } from '@/features/settings/components/ProfileEditScreen';

// 프로필 수정 페이지. 별도 라우트라 브라우저 뒤로가기도 "뒤로 가기"와 같게 동작한다.
export default function ProfileEditPage() {
  return <ProfileEditScreen />;
}
