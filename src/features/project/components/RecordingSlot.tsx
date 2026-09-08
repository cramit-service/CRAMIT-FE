// src/features/project/components/RecordingSlot.tsx
// 새 주차 등록 화면의 세 번째 칸 — "바로 녹음하기".
//
// 아직 동작하지 않는다. 녹음은 브라우저에서 받아 청크로 올려야 하는데 그 엔드포인트가
// 아직 없어서 별도 이슈로 뗐다. 그래도 자리를 비워 두지 않는 이유는, 자료 두 개만
// 놓이면 "가진 파일을 올리는 화면"으로만 읽혀서 — 수업을 들으면서 쓰는 흐름이
// 이 화면의 존재 이유인데 그게 안 보인다.
//
// 대신 눌리지 않는다는 걸 분명히 한다: 흐린 색만으로는 고장인지 준비 중인지 알 수 없어
// 배지와 툴팁으로 함께 말한다(SidebarItem의 "준비 중이에요"와 같은 규칙).
import { MicIcon } from './icons';

export function RecordingSlot() {
  return (
    <div className="flex flex-col gap-[22px]">
      <p className="text-body-md flex items-center gap-2 text-gray-300">
        바로 녹음하기
        <span className="text-label rounded-full bg-gray-800 px-2 py-0.5 text-gray-500">
          준비 중
        </span>
      </p>

      <div
        aria-disabled
        title="준비 중이에요"
        className="flex h-[270px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-700 bg-gray-800/50 px-[22px] text-center opacity-60"
      >
        <MicIcon className="size-[22px] text-gray-400" />
        <p className="text-button-sm text-gray-300">수업을 들으면서 녹음</p>
        <p className="text-label text-gray-600">
          끝나면 그대로 요약·스크립트까지
          <br />
          이어집니다
        </p>
      </div>
    </div>
  );
}
