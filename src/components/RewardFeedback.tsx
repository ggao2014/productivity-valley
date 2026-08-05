import { useEffect } from 'react'
import { useGameStore } from '../core/gameStore'
import { GameIcon } from '../assets/icons/GameIcon'

export function RewardFeedback() {
  const reward = useGameStore((s) => s.rewardFeedback)
  const clear = useGameStore((s) => s.clearRewardFeedback)

  useEffect(() => {
    if (!reward) return
    const id = window.setTimeout(clear, 1800)
    return () => window.clearTimeout(id)
  }, [clear, reward])

  if (!reward) return null

  const headline =
    reward.kind === 'project_complete'
      ? '项目完成'
      : reward.kind === 'project_milestone'
        ? '项目进度奖励'
        : reward.kind === 'project_block'
          ? '分块完成'
          : reward.kind === 'habit'
            ? '习惯已打卡'
            : '待办完成'

  return (
    <div key={reward.id} className="reward-feedback" role="status">
      <span className="reward-check" aria-hidden="true">
        <GameIcon name="check" />
      </span>
      <div>
        <strong>{headline}</strong>
        {reward.title && <small>{reward.title}</small>}
        {reward.progressAfter !== undefined && (
          <div className="reward-progress" aria-label={`项目进度 ${reward.progressAfter}%`}>
            <i style={{ width: `${reward.progressAfter}%` }} />
          </div>
        )}
        <p>
          <span><GameIcon name="coin" />+{reward.coins} 金币</span>
          {reward.bond > 0 && (
            <span><GameIcon name="energy" />+{reward.bond} 精力</span>
          )}
        </p>
      </div>
      <i className="reward-spark spark-a" aria-hidden="true" />
      <i className="reward-spark spark-b" aria-hidden="true" />
      <i className="reward-spark spark-c" aria-hidden="true" />
    </div>
  )
}
