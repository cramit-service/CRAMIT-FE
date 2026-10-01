// src/app/(main)/settings/profile/page.tsx
import { ProfileScreen } from '@/features/settings/components/ProfileScreen';

// 대시보드-프로필 페이지. 사이드바 "내 정보 수정"이 가리키는 곳이다.
// page.tsx는 얇게 유지하고 조립만 한다.
export default function ProfilePage() {
  return <ProfileScreen />;
}
