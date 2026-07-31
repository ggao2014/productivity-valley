import { useGameStore } from '../core/gameStore'

const COPY = {
  1: {
    eyebrow: '第一步 · 写下来',
    title: '今天想完成什么？',
    body: '输入一项具体、可以完成的待办。',
  },
  2: {
    eyebrow: '第二步 · 去完成',
    title: '完成待办，领取奖励',
    body: '完成刚才的待办，再回来点一下“完成”。',
  },
  3: {
    eyebrow: '第三步 · 去见一个人',
    title: '使用精力与角色互动',
    body: '回到山谷，选择一位角色聊天。',
  },
  4: {
    eyebrow: '引导完成',
    title: '新手引导完成',
    body: '完成待办可获得金币和精力，用于扩建、购买和角色互动。',
  },
} as const

export function OnboardingGuide() {
  const step = useGameStore((s) => s.onboardingStep)
  const tab = useGameStore((s) => s.tab)
  const setTab = useGameStore((s) => s.setTab)
  const setStep = useGameStore((s) => s.setOnboardingStep)

  if (step === 0) return null
  const copy = COPY[step]
  const targetTab = step <= 2 ? 'tasks' : 'valley'
  const showNavigate = step < 4 && tab !== targetTab

  return (
    <aside className={`onboarding-guide step-${step}`} aria-live="polite">
      <div
        className="onboarding-progress"
        aria-label={`新手引导第 ${Math.min(step, 3)} 步，共 3 步`}
      >
        {[1, 2, 3].map((n) => (
          <i key={n} className={step >= n ? 'active' : ''} />
        ))}
      </div>
      <span className="onboarding-eyebrow">{copy.eyebrow}</span>
      <strong>{copy.title}</strong>
      <p>{copy.body}</p>
      <div className="onboarding-actions">
        {showNavigate && (
          <button className="btn" onClick={() => setTab(targetTab)}>
            {targetTab === 'tasks' ? '去待办' : '回到山谷'}
          </button>
        )}
        {step === 4 ? (
          <button className="btn" onClick={() => setStep(0)}>
            完成
          </button>
        ) : (
          <button className="guide-skip" onClick={() => setStep(0)}>
            跳过引导
          </button>
        )}
      </div>
    </aside>
  )
}
