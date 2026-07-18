// src/app/(main)/home/page.tsx
// ⚠️ 임시 placeholder — 홈 콘텐츠는 홈 담당자가 구현 예정.
// (main) 레이아웃(사이드바)이 children을 감싸는 구조를 확인하기 위한 최소 페이지다.
// 실제 홈 화면이 들어오면 이 파일 내용을 교체한다.
export default function HomePage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-900">
        홈 (임시 placeholder)
      </h1>
      <p className="mt-2 text-gray-600">
        홈 콘텐츠는 담당자가 구현합니다. 사이드바 레이아웃 확인용 페이지입니다.
      </p>
    </div>
  );
}
