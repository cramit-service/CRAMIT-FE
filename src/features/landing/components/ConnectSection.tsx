// src/features/landing/components/ConnectSection.tsx

const FEATURES = [
  {
    title: 'AI 기반 강의 요약',
    description: '강의자료와 녹음을 분석해 핵심 내용을 자동으로 정리합니다.',
  },
  {
    title: '자료 자동 연결',
    description:
      'PDF와 음성을 페이지 단위로 연결해 원하는 내용을 빠르게 찾아 복습합니다.',
  },
  {
    title: '맞춤형 학습 관리',
    description:
      '메모와 TODO를 통해 시험 준비까지의 과정을 체계적으로 관리합니다.',
  },
];

export function ConnectSection() {
  return (
    <section className="bg-gray-950 px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <h2 className="text-secondary-400 text-2xl font-bold md:text-4xl">
            크래밋이 당신의 학습을 연결합니다.
          </h2>
          <p className="text-sm leading-relaxed text-gray-400 md:pt-2">
            우리는 단순히 강의를 요약하지 않습니다. 강의자료와 녹음, 메모를
            연결해 더 효율적인 복습 경험을 제공합니다.
          </p>
        </div>

        <ul className="mt-28 grid gap-12 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              {/* TODO: 기능 아이콘 확정되면 교체 */}
              <div className="h-12 w-12 rounded-full bg-gray-800" aria-hidden />
              <h3 className="text-secondary-400 mt-6 text-sm font-bold">
                {feature.title}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
