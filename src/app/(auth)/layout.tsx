// src/app/(auth)/layout.tsx

// 로그인 전 공통 레이아웃.
// 화면마다 배경·정렬이 다르므로(로그인=그라데이션 위 중앙 정렬, 온보딩=평평한 배경 + 상하 고정)
// 여기서는 최소 골격만 두고 배경과 정렬은 각 화면이 직접 잡는다.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-screen">{children}</main>;
}
